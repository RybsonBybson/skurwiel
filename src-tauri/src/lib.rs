use std::fs;
use tauri::Manager;
use tauri::Emitter;
use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Serialize, Deserialize, Clone)]
struct Message {
    role: String,
    content: String,
}

#[derive(Serialize, Deserialize)]
struct ChatFile {
    title: String,
    history: Vec<Message>,
}

#[derive(Serialize)]
struct OllamaRequest {
    model: String,
    messages: Vec<Message>,
    stream: bool,
    think: bool
}

#[derive(Deserialize)]
struct OllamaStreamMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct OllamaStreamResponse {
    message: OllamaStreamMessage,
    done: bool,
}
fn get_chat_path(app: &tauri::AppHandle, id: &str) -> Result<std::path::PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())
        .map(|p| p.join("chats").join(format!("{}.jsonl", id)))
}

#[tauri::command]
fn load_chat(app: tauri::AppHandle, id: &str) -> Result<ChatFile, String> {
    let path = get_chat_path(&app, id)?;
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn send_message(
    app: tauri::AppHandle,
    id: String,
    text: String,
) -> Result<String, String> {
    let path = get_chat_path(&app, &id)?;

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut chat: ChatFile = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    chat.history.push(Message {
        role: "user".to_string(),
        content: text,
    });

    let client = Client::new();
    let mut response = client
        .post("http://localhost:11434/api/chat")
        .json(&OllamaRequest {
            model: "qwen3.5:latest".to_string(),
            messages: chat.history.clone(),
            stream: true,
            think: false
        })
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let mut full_reply = String::new();
    let mut reader = response.bytes_stream();
    
    use futures::stream::StreamExt;
    
    while let Some(chunk) = reader.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        let chunk_str = String::from_utf8(chunk.to_vec()).map_err(|e| e.to_string())?;
        
        for line in chunk_str.lines() {
            if line.is_empty() {
                continue;
            }
            
            if let Ok(stream_msg) = serde_json::from_str::<OllamaStreamResponse>(line) {
                let token = &stream_msg.message.content;
                full_reply.push_str(token);
                
                // Emit token to frontend
                let _ = app.emit("stream-token", serde_json::json!({
                    "token": token,
                    "id": &id
                }));
            }
        }
    }

    chat.history.push(Message {
        role: "assistant".to_string(),
        content: full_reply.clone(),
    });

    fs::write(&path, serde_json::to_string(&chat).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    Ok(full_reply)
}

#[derive(Serialize)]
struct ChatMeta {
    id: String,
    title: String,
}

#[tauri::command]
fn update_chat_title(app: tauri::AppHandle, id: &str, title: &str) -> Result<(), String> {
    let path = get_chat_path(&app, id)?;
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut chat: ChatFile = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    
    chat.title = title.to_string();
    
    fs::write(&path, serde_json::to_string(&chat).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_chat(app: tauri::AppHandle, id: &str) -> Result<(), String> {
    let path = get_chat_path(&app, id)?;
    fs::remove_file(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_chats(app: tauri::AppHandle) -> Result<Vec<ChatMeta>, String> {
    let dir = app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("chats");

    if !dir.exists() {
        return Ok(vec![]);
    }

    let mut chats = vec![];
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("jsonl") {
            continue;
        }
        let id = path.file_stem().unwrap().to_str().unwrap().to_string();
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let chat: ChatFile = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        chats.push(ChatMeta { id, title: chat.title });
    }

    Ok(chats)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![load_chat, send_message, update_chat_title, delete_chat, list_chats])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
