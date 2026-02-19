import { useState } from "react";
import { Modal } from "../ui";
import DisponibilidadManager from "./DisponibilidadManager";

export default function DisponibilidadModal({ isOpen, onClose }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <DisponibilidadManager onClose={onClose} />
        </Modal>
    );
}
