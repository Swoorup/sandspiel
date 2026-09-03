const admins = [
  "maxbittker@gmail.com",
];

export const isAdmin = (email?: string) =>
  !!email && admins.some((a) => a.toLowerCase() === email.toLowerCase());

export default admins;
