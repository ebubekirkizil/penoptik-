const test2 = async () => {
  const cards = [
    { serialCode: "001" },
    { serialCode: "002" },
    { serialCode: "A001" }
  ];
  let maxNum = 0;
  for (const card of cards) {
    if (card.serialCode.match(/^\d+$/)) {
      const num = parseInt(card.serialCode, 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }
  console.log("Maxnum:", maxNum);
};
test2();
