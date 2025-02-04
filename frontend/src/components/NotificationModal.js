import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotificationModal = ({ isOpen, onClose, title, message, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white p-6 rounded-2xl shadow-lg w-96"
            >
                <Card>
                    <CardContent className="flex flex-col gap-4">
                        <h2 className="text-xl font-semibold text-center">{title}</h2>
                        <p className="text-gray-600 text-center">{message}</p>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={onClose}>
                                Отмена
                            </Button>
                            <Button onClick={onConfirm}>OK</Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default NotificationModal;
