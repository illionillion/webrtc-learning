import { FC, useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";

export const Live: FC = () => {
    const socket: Socket = io(
        // サーバーのURLを指定
        'http://localhost:3001'
    );
    /**
     * video取得
     * @type {HTMLVideoElement}
     */
    const videoRef = useRef<HTMLVideoElement>(null)
    /**
     * RTCPeerConnectionをクライアントごとに格納する変数
     * keyをクライアントID（ソケットID）として保存する
     */
    const connections: { [key: string]: any; } = {}
    const init = async () => {
        try {
            // PCカメラのstream取得
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    // width: cameraWidth,
                    // height: cameraHeight,
                    facingMode: "environment",
                },
                // audio: true,
            })

            // streamをvideoにつなげる
            if (videoRef.current) videoRef.current.srcObject = stream

            // ソケットサーバー疎通確認
            socket.on('connect', () => console.log('socket', 'connected'))

            // 配信要求を受ける
            // Client ID （cid）を受け取りコネクションを作成する
            socket.on('request', ({ cid }) => sendOffer(cid, stream))

            // アンサーを受ける
            socket.on('answer', async ({ cid, answer }) => {
                if (cid in connections) connections[cid].setRemoteDescription(answer)
            })
        } catch (e) {
            return
        }
    }

    /**
     * オファーを送信する
     *
     * @param {string} cid Client ID
     * @return {void}
     */
    async function sendOffer(cid: string, stream: MediaStream) {
        // コネクションの設定
        const pcConfig = {
            // STUNサーバーはGoogle様のものを利用させていただく
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        }

        console.log(cid);
        
        // コネクションの作成
        const peer = new RTCPeerConnection(pcConfig)

        // cidをキーとしてコネクションを保存
        connections[cid] = peer

        // コネクションにストリームを設定
        stream.getTracks().forEach(track => peer.addTrack(track, stream))

        // ICE candidateを取得イベントハンドラ
        peer.onicecandidate = evt => {
            console.log(evt);
            
            // evt.candidateがnullならICE Candidateを全て取得したとみなしてオファーを送信
            if (!evt.candidate) {
                socket.emit('offer', { offer: peer.localDescription, cid }
            )}
        }

        // オファーを作成
        const offer = await peer.createOffer()

        // オファーを自身に設定
        // STUNサーバーへアクセスが始まり、onicecandidateが呼ばれるようになる
        await peer.setLocalDescription(offer)
    }

    useEffect(() => {
        init()
    }, [])

    return <>
        <video autoPlay ref={videoRef}></video>
    </>
}