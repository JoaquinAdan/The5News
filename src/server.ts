import app from "./app";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`The5News running on http://localhost:${PORT}`));
