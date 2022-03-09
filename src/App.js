import 'react-bulma-components/dist/react-bulma-components.min.css';
import "./components/EmptyPlaceholder.css"
import {Container, Columns, Image, Navbar, Modal} from 'react-bulma-components/dist';
import React, {useRef, useEffect, useState} from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import UserInfo from "./components/UserInfo";
import ShareRequest from "./components/ShareRequest";
import ImageUploader from "./components/ImageUploader";
import EmptyPlaceholder from "./components/EmptyPlaceholder";
import Loader from "./components/Loader";
import logo from './logo.png'

function App() {
    const socket = useRef();
    const peerInstance = useRef();
    const [requested, setRequested] = useState(false);
    const [sentRequest, setSentRequest] = useState(false);
    const [sending, setSending] = useState(false);
    const [receiving, setReceiving] = useState(false);
    const [rejected, setRejected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [myUsername, setMyUsername] = useState("");
    const [usersList, setUsersList] = useState([]);
    const [peerUsername, setPeerUsername] = useState("");
    const [peerSignal, setPeerSignal] = useState("");
    const SOCKET_EVENT = {
        CONNECTED: "connected",
        DISCONNECTED: "disconnect",
        USERS_LIST: "users_list",
        REQUEST_SENT: "request_sent",
        REQUEST_ACCEPTED: "request_accepted",
        REQUEST_REJECTED: "request_rejected",
        SEND_REQUEST: "send_request",
        ACCEPT_REQUEST: "accept_request",
        REJECT_REQUEST: "reject_request",
    };
    const peerConfig = {
        iceServers: [
            {urls: 'stun:stun.l.google.com:19302'},
            {urls: 'stun:stun1.l.google.com:19302'},
            {urls: 'stun:stun2.l.google.com:19302'},
            {urls: 'stun:stun3.l.google.com:19302'},
            {urls: 'stun:stun4.l.google.com:19302'},
        ],
    };
    const acceptRequest = () => {
        setRequested(false);
        const peer = new Peer({
            initiator: false,
            trickle: false
        });
        peer.on("signal", (data) => {
            socket.current.emit(SOCKET_EVENT.ACCEPT_REQUEST, {signal: data, to: peerUsername});
        });
        peer.on("connect", () => {
            setReceiving(true);
        });
        const fileChunks = [];
        peer.on('data', data => {

            if (data.toString() === 'EOF') {
                // Once, all the chunks are received, combine them to form a Blob
                const file = new Blob(fileChunks);
                setReceivedFilePreview(URL.createObjectURL(file));
                setReceiving(false);
            } else {
                // Keep appending various file chunks
                fileChunks.push(data);
            }

        });

        peer.signal(peerSignal);
        peerInstance.current = peer;

    };
    const rejectRequest = () => {
        socket.current.emit(SOCKET_EVENT.REJECT_REQUEST, {to: peerUsername});
        setRequested(false);
    };
    const sendRequest = (username) => {
        setLoading(true);
        setPeerUsername(username);
        const peer = new Peer({
            initiator: true,
            trickle: false,
            config: peerConfig,
        });
        peer.on("signal", (data) => {
            socket.current.emit(SOCKET_EVENT.SEND_REQUEST, {
                to: username,
                signal: data,
                username: myUsername,
            });
            setSentRequest(true);
            setLoading(false);
        });
        peer.on("connect", async () => {
            setSending(true);
            setSentRequest(false);
            let buffer = await file.arrayBuffer();
            const chunkSize = 16 * 1024;
            while (buffer.byteLength) {
                const chunk = buffer.slice(0, chunkSize);
                buffer = buffer.slice(chunkSize, buffer.byteLength);

                // Off goes the chunk!
                peer.send(chunk);
            }
            peer.send('EOF');
            setSending(false);
        });
        peerInstance.current = peer;

    };
    const SERVER_URL = "ws://localhost:7000/";
    useEffect(() => {
        socket.current = io.connect(SERVER_URL);

        socket.current.on(SOCKET_EVENT.CONNECTED, (username) => {
            setMyUsername(username)
        });
        socket.current.on(SOCKET_EVENT.USERS_LIST, (users) => {
            setUsersList(users)
        });

        socket.current.on(SOCKET_EVENT.REQUEST_SENT, ({signal, username}) => {
            setPeerUsername(username);
            setPeerSignal(signal);
            setRequested(true);
        });
        socket.current.on(SOCKET_EVENT.REQUEST_ACCEPTED, ({signal}) => {
            peerInstance.current.signal(signal)
        });
        socket.current.on(SOCKET_EVENT.REQUEST_REJECTED, () => {
            setSentRequest(false);
            setRejected(true);

        });
    }, []);
    const [file, setFile] = useState(null);
    const [receivedFilePreview, setReceivedFilePreview] = useState("");
    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        URL.revokeObjectURL(receivedFilePreview)
    }, [receivedFilePreview]);

    return (
        <React.Fragment>
            <Navbar
                fixed="top"
                active={false}
                transparent
            >
                <Navbar.Brand>
                    <Navbar.Item renderAs="a" href="#">
                        <img src={logo}
                             alt="Pic Share"/>
                    </Navbar.Item>
                    <Navbar.Burger/>
                </Navbar.Brand>
            </Navbar>
            <Modal show={receivedFilePreview !== "" || sending || receiving || sentRequest || rejected || requested}
                   onClose={() => {
                       if (!sending || !receiving || !sentRequest || !requested)
                           setReceivedFilePreview("");
                       setRejected(false);
                   }}>
                <Modal.Content>

                    {requested &&
                    <ShareRequest acceptRequest={acceptRequest} rejectRequest={rejectRequest}
                                  peerUsername={peerUsername}/>
                    }
                    {(sending || receiving || sentRequest) &&
                    <Loader
                        text={sending ? "the picture is being sent, please wait..." : sentRequest ? "Wait till user accepts your request" : "receiving picture, please wait... "}/>
                    }
                    {rejected &&
                    <UserInfo myUsername={peerUsername}
                              subtext={`${peerUsername} Rejected your request, sorry!`}
                              color="#ffcac8"

                    />}

                    {receivedFilePreview &&
                    <React.Fragment>
                        <UserInfo myUsername={peerUsername} subtext={`${peerUsername} has sent you this image`}
                                  color="#c7ffcc"/>
                        <Image src={receivedFilePreview}/>
                    </React.Fragment>
                    }


                </Modal.Content>
            </Modal>
            <Container fluid>
                <Columns>
                    <Columns.Column size="three-fifths">
                        <UserInfo myUsername={myUsername}
                                  subtext="Share your username with others so they can send you a picture"
                                  color="#EFFFFF"
                        />
                        <ImageUploader setFile={setFile}/>


                    </Columns.Column>
                    <Columns.Column>
                        {usersList.length > 1 ? usersList.map(({username, timestamp}) => username !== myUsername &&
                            <UserInfo key={username} myUsername={username} timestamp={timestamp}
                                      sendRequest={sendRequest} disabled={!file || loading}/>
                            ) :
                            <EmptyPlaceholder title="No Users Online Right Now!"
                                              subtitle="Wait till someone connects to start sharing"
                                              image="data:image/png;base64,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"/>
                        }


                    </Columns.Column>
                </Columns>
            </Container>

        </React.Fragment>
    );
}

export default App;
