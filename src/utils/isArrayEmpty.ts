const isArrayEmpty = (array: any) => {
  if (Array.isArray(array) && array.length === 0) return true;
  return false;
};

export default isArrayEmpty;
