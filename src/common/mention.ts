export const Mention = (kind: 'USER' | 'CHANNEL' | 'ROLE', id: string) => {
  switch (kind) {
    case 'CHANNEL':
      return `<#${id}>`;
    case 'ROLE':
      return `<@&${id}>`;
    case 'USER':
      return `<@${id}>`;
  }
};
