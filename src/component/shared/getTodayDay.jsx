export const getTodayDay = () => {
  const day = new Date();
  let numDay = day.getDay();
  let today = "other";

  switch (numDay) {
    case 0:
      return (today = "sunday");
    case 1:
      return (today = "monday");
    case 2:
      return (today = "tuesday");
    case 3:
      return (today = "wednesday");
    case 4:
      return (today = "thursday");
    case 5:
      return (today = "friday");
    case 6:
      return (today = "saturday");
    default:
      return today;
  }
};
