// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");
const loginFileInput = login.querySelector(".login__file");

// chat elements
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");
const chatFileInput = chat.querySelector(".chat__file");
const chatFileButton = chat.querySelector(".chat__file-button");

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
];

const user = { id: "", name: "", color: "", profilePicture: "" };

let websocket;

const createMessageSelfElement = (content, isImage = false) => {
    const div = document.createElement("div");
    div.classList.add("message--self");

    const img = document.createElement("img");
    img.classList.add("message--profile-picture");
    img.src = user.profilePicture;
    div.appendChild(img);

    const span = document.createElement("span");
    if (isImage) {
        const messageImg = document.createElement("img");
        messageImg.src = content;
        span.appendChild(messageImg);
    } else {
        span.innerHTML = content;
    }
    div.appendChild(span);

    return div;
};

const createMessageOtherElement = (content, sender, senderColor, profilePicture, isImage = false) => {
    const div = document.createElement("div");
    div.classList.add("message--other");

    const img = document.createElement("img");
    img.classList.add("message--profile-picture");
    img.src = profilePicture;
    div.appendChild(img);

    const senderDiv = document.createElement("div");
    senderDiv.classList.add("message--sender");
    senderDiv.style.color = senderColor;
    senderDiv.innerText = sender;
    div.appendChild(senderDiv);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("message--content");
    if (isImage) {
        const messageImg = document.createElement("img");
        messageImg.src = content;
        contentDiv.appendChild(messageImg);
    } else {
        contentDiv.innerHTML = content;
    }
    div.appendChild(contentDiv);

    return div;
};


const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content, isImage, profilePicture } = JSON.parse(data);

    const message = userId == user.id
        ? createMessageSelfElement(content, isImage)
        : createMessageOtherElement(content, userName, userColor, profilePicture, isImage);

    chatMessages.appendChild(message);

    scrollScreen();

    if (userId !== user.id) {
        showNotification(userName, content);
    }
};

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    const file = loginFileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        user.profilePicture = reader.result;

        login.style.display = "none";
        chat.style.display = "flex";

        websocket = new WebSocket("wss://yumi-backend.onrender.com");
        websocket.onmessage = processMessage;
    };
    reader.readAsDataURL(file);
};

const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value,
        isImage: false,
        profilePicture: user.profilePicture
    };

    websocket.send(JSON.stringify(message));

    chatInput.value = "";

    showNotification(user.name, message.content);
};

const sendFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
        const message = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: reader.result,
            isImage: true,
            profilePicture: user.profilePicture
        };

        websocket.send(JSON.stringify(message));
        showNotification(user.name, "Imagem enviada");
    };
    reader.readAsDataURL(file);
};

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);

chatFileButton.addEventListener("click", () => {
    chatFileInput.click();
});

chatFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        sendFile(file);
    }
});

// Request permission for notifications
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
        new Notification(title, { body });
    }
};
