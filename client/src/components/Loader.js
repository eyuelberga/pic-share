import "./Loader.css"
import React from "react";

export default function Loader({text}) {
    return (
        <React.Fragment>
            <div className="loader">Loading..</div>
            <h1 style={{textAlign: "center", color: "white", fontSize: "2em"}}>{text}</h1>
        </React.Fragment>
    )
}