export function isEmail(identifier: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(identifier);
  }
  
export function isPhone(identifier: string): boolean {
    const phoneRegex = /^\d{10,15}$/; // Accepts 10 to 15 digit numbers
    return phoneRegex.test(identifier);
  }