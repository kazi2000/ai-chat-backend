(function () {
  const div = document.createElement("div");
  div.innerHTML = `
    <div style="position:fixed;bottom:20px;right:20px;width:300px;background:#fff;border:1px solid #ccc;padding:10px;z-index:9999;">
      <div id="messages" style="height:200px;overflow:auto;"></div>
      <input id="input" placeholder="Type message..." style="width:80%;" />
      <button id="sendBtn">Send</button>
    </div>
  `;
  document.body.appendChild(div);

  document.getElementById("sendBtn").onclick = async function () {
    const input = document.getElementById("input");
    const msg = input.value;

    const res = await fetch("https://ai-chat-backend-c3y7.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: msg,
        sessionId: "shopify-user"
      })
    });

    const data = await res.json();

    const messages = document.getElementById("messages");
    messages.innerHTML += "<div><b>You:</b> " + msg + "</div>";
    messages.innerHTML += "<div><b>AI:</b> " + data.reply + "</div>";

    input.value = "";
  };
})();
