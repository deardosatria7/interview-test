import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <>
      <div className="h-screen mx-auto overflow-hidden flex items-center justify-center gap-4">
        <Loader className="animate-spin w-5 h-5" />
        Loading...
      </div>
    </>
  );
}
