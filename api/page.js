const sendMessage = async () => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: inputText })
  });
  
  const data = await res.json();
  console.log(data.reply); // Ye AI ka reply hai
}
