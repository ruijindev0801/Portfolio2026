import { toast } from "sonner";

/** Copies the address and confirms with a toast. Returns false if the browser refused. */
export async function copyEmail(email: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(email);
    toast.success("Email copied", { description: email });
    return true;
  } catch {
    toast.error("Couldn't copy. Your browser blocked clipboard access.");
    return false;
  }
}
