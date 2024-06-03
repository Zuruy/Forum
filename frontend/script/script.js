document.addEventListener("DOMContentLoaded", () => {
    // Login elements
    const login = document.querySelector(".login");
    const loginForm = login.querySelector(".login_form");
    const loginInput = login.querySelector(".input_login");

    // Chat elements
    const chat = document.querySelector(".chat");
    const chatForm = chat.querySelector(".chat_form");
    const chatInput = chat.querySelector(".input_chat");
    const chatMessages = chat.querySelector(".chat_messagem");

    const colors = [
        "cadetblue",
        "darkgoldenrod",
        "cornflowerblue",
        "darkkhaki",
        "hotpink",
        "gold",
        "crimson"
    ];

    const user = { id: "", name: "", color: "" };

    let websocket;

    const createMessageSelfElement = (content) => {
        const div = document.createElement("div");
        div.classList.add("send");
        div.innerHTML = content;
        return div;
    };

    const createMessageOtherElement = (content, sender, senderColor) => {
        const div = document.createElement("div");
        const span = document.createElement("span");

        div.classList.add("other");

        span.classList.add("sender");
        span.style.color = senderColor;
        span.innerHTML = sender;

        div.appendChild(span);
        div.innerHTML += content;

        return div;
    };

    const getRandomColor = () => {
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    };

    const processMessage = ({ data }) => {
        const { userId, userName, userColor, content } = JSON.parse(data);

        const message = userId === user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor);

        chatMessages.appendChild(message);
        scrollScreen();
    };

    const handleLogin = (event) => {
        event.preventDefault();

        user.color = getRandomColor();
        user.id = crypto.randomUUID();
        user.name = loginInput.value;

        login.style.display = "none";
        chat.style.display = "flex";
        console.log(user);

        websocket = new WebSocket("ws://localhost:8080");
        websocket.onmessage = processMessage;
    };

    const sendMessage = (event) => {
        event.preventDefault();

        const message = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: chatInput.value
        };

        websocket.send(JSON.stringify(message));
        chatInput.value = "";
    };

    loginForm.addEventListener("submit", handleLogin);
    chatForm.addEventListener("submit", sendMessage);
});

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
}
