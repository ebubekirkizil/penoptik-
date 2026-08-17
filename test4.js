const test = async () => {
  try {
    console.log("Fetching check...");
    const res = await fetch("https://sentientwire.com/api/nfc/admin/check?scannedId=001");
    const data = await res.text();
    console.log("check:", data);
  } catch (err) {
    console.error(err);
  }
};
test();
