import { Construction } from "lucide-react";

export function ComingSoon({ title, description }) {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <Construction className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {description ?? "Este módulo estará disponible próximamente."}
        </p>
      </div>
    </div>
  );
}
