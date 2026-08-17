const test = async () => {
  try {
    console.log("Fetching next-serial...");
    const res = await fetch("https://sentientwire.com/api/nfc/admin/next-serial");
    const data = await res.text();
    console.log("next-serial:", data);

    const json = JSON.parse(data);
    if (json.nextSerial) {
      console.log("Fetching check for", json.nextSerial);
      const res2 = await fetch(`https://sentientwire.com/api/nfc/admin/check?scannedId=${json.nextSerial}`);
      const data2 = await res2.json();
      console.log("check:", data2);
    }
  } catch (err) {
    console.error(err);
  }
};
test();
