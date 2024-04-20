const MAX_LEN = 5;

export const generate = () => {
  let ans = "";
  const subset = "1234567890abcdefghijklmnopqrstuvwxyz";

  for (let i = 0; i < MAX_LEN; i++) {
    ans += subset[Math.floor(Math.random() * subset.length)];
  }
  return ans;
};
