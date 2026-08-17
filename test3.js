const test = async () => {
  try {
    console.log("Fetching next-serial...");
    const res = await fetch("http://localhost:3001/api/nfc/admin/next-serial");
    const data = await res.text();
    console.log("next-serial:", data);
  } catch (err) {
    console.error(err);
  }
};
test();
