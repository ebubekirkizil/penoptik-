async function run() {
  try {
    const res = await fetch("https://sentientwire.com/api/nfc/admin/next-serial");
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error(err);
  }
}
run();
