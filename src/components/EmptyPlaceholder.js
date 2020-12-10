import {Image} from "react-bulma-components";
import React from "react";
import "./EmptyPlaceholder.css"
export default function EmptyPlaceholder({image, title, subtitle}){
    return (
        <div className="empty">
            <Image size={128}
                   src={image}
            />
            <h1 className="title">{title}</h1>
            <h2 className="subtitle">{subtitle}</h2>
        </div>
    )
}