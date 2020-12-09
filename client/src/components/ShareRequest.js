import {Button, Card, Content, Image, Media} from "react-bulma-components";
import {generateFromString} from "generate-avatar";
import React from "react";

export default function ShareRequest({peerUsername, acceptRequest, rejectRequest}) {
    return (
        <Card style={{margin: "10px auto"}}>
            <Card.Header>
                <Card.Header.Title>Share Request</Card.Header.Title>
            </Card.Header>
            <Card.Content>
                <Media>
                    <Media.Item renderAs="figure" position="left">
                        <Image rounded size={64} alt="64x64"
                               src={`data:image/svg+xml;utf8,${generateFromString(peerUsername)}`}/>
                    </Media.Item>
                    <Media.Item>
                        <Content>
                            <p>
                                <strong>{peerUsername}</strong>
                                <br/>
                                {peerUsername} wants to send you a picture
                            </p>
                        </Content>
                    </Media.Item>
                </Media>
            </Card.Content>
            <Card.Footer>
                <Card.Footer.Item> <Button color="success" rounded onClick={acceptRequest}
                                           fullwidth>Accept</Button></Card.Footer.Item>
                <Card.Footer.Item><Button color="danger" rounded onClick={rejectRequest}
                                          fullwidth>Reject</Button></Card.Footer.Item>
            </Card.Footer>
        </Card>)
}