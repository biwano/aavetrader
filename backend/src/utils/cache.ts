export const cached = <T>(func: () => T) => {
  let res: T | null = null;
  return () => {
    if (!res) res = func();
    return res;
  };
};
