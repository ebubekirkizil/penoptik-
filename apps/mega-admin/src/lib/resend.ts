// Mock resend for demo
export const resend = {
  emails: {
    send: (..._args: any[]) => Promise.resolve({ id: "mock" })
  }
};