import { ClipboardList } from "lucide-react";

const EmptyState = ({ title, description }) => (
  <div className="panel grid place-items-center px-6 py-12 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-stone-100 text-stone-500">
      <ClipboardList size={24} />
    </div>
    <h3 className="text-base font-bold">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>
  </div>
);

export default EmptyState;
