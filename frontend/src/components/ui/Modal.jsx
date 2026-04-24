import { Dialog } from "@headlessui/react";

export const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded-2xl bg-white p-6 w-full shadow-2xl dark:bg-slate-800 dark:border dark:border-slate-700 transition-colors">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4 dark:text-slate-50">
            {title}
          </Dialog.Title>
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
