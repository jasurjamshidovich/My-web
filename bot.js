// ===== TELEGRAM БОТ С РАССЫЛКОЙ =====
// Это отдельный серверный файл. Запускается через: node bot.js
// НЕ подключай его на сайт через <script> — он будет работать только на сервере.

const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

// ⚠️ Смени токен через @BotFather (/revoke), старый уже "засветился" на сайте
const TG_TOKEN = 8749136533:AAEtOd33O0cyZ8_buAf3z8g0f1gLKcKi1cY;

// Твой личный Telegram ID (не chat_id сайта, а ID твоего аккаунта)
const OWNER_ID = 8492178931; // если это не твой личный ID — узнать способом ниже

const USERS_FILE = path.join(__dirname, "users.json");

const bot = new TelegramBot(TG_TOKEN, { polling: true });

// ---- Загрузка / сохранение списка пользователей ----
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ---- Обработка входящих сообщений ----
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  // Показать ID в консоли — удобно, чтобы узнать свой OWNER_ID
  console.log(`Сообщение от ${chatId}: ${text}`);

  let users = loadUsers();

  // Запоминаем пользователя, если его ещё нет в списке
  if (!users.includes(chatId)) {
    users.push(chatId);
    saveUsers(users);
    console.log(`Новый пользователь добавлен: ${chatId}`);
  }

  // Команда /start — приветствие
  if (text === "/start") {
    bot.sendMessage(chatId, "Привет! Ты подписан на уведомления с сайта.");
    return;
  }

  // ==== РАССЫЛКА ОТ ВЛАДЕЛЬЦА ====
  // Если пишет владелец и это НЕ команда (не начинается с "/") — рассылаем всем
  if (chatId === OWNER_ID && text && !text.startsWith("/")) {
    let sent = 0;
    let failed = 0;

    users.forEach((userId) => {
      if (userId === OWNER_ID) return; // себе не шлём

      bot
        .sendMessage(userId, text)
        .then(() => {
          sent++;
        })
        .catch((err) => {
          failed++;
          console.log(`Не удалось отправить ${userId}: ${err.message}`);
        });
    });

    bot.sendMessage(
      OWNER_ID,
      `✅ Рассылка отправлена. Получателей: ${users.length - 1}`
    );
  }
});

console.log("Бот запущен и слушает сообщения...");
