import React from "react";

export default function Footer() {
    return <div className="flex justify-between h-60 mt-40 mb-40 container mx-auto">
        <div className="flex text-dark-gray">
            <div className="cursor-pointer">Docs</div>
            <div className="ml-10 mr-10 cursor-pointer">Terms</div>
            <div className="cursor-pointer">Contracts</div>
        </div>
        <div className="text-dark-gray">1.2</div>
    </div>
}