import {Box, Button, Content, Image, Media} from "react-bulma-components";
import {generateFromString} from "generate-avatar";
import React from "react";

export default function UserInfo({myUsername, timestamp, sendRequest, disabled, subtext, color}) {
    return (
        <Box style={!color ? {} : {backgroundColor: color}}>
            <Media>
                <Media.Item renderAs="figure" position="left">
                    <Image rounded size={64} alt="64x64"
                           src={`data:image/svg+xml;utf8,${generateFromString(myUsername)}`}/>
                </Media.Item>
                <Media.Item>
                    <Content>
                        <p>
                            <strong>{myUsername}</strong> <small>{timestamp}</small>
                            <br/>
                            {typeof sendRequest === "function" &&
                            <Button disabled={disabled} fullwidth rounded color="info"
                                    onClick={() => {
                                        sendRequest(myUsername)
                                    }}>Share
                                Picture</Button>}
                            {subtext}
                        </p>
                    </Content>
                </Media.Item>
            </Media>
        </Box>
    )
}