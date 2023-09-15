import { FC, useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";

export const View: FC = () => {
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
     * コネクションを保存しておく用
     *
     * @type {RTCPeerConnection}
     */
    let connection: RTCPeerConnection | null = null

    const handleClick = () => {
        if (videoRef?.current?.paused) {
            videoRef.current.play()
        } else {
            // videoRef?.current?.pause()
        }
    }

    const init = async () => {

        // ソケット接続で配信要求する
        socket.on('connect', () => socket.emit('request'))

        // アンサーを受ける
        socket.on('offer', async ({ offer }) => sendAnswer(offer))

        // closeがきたらコネクションを切ってvideoも止める
        socket.on('close', () => {
            if (connection && videoRef?.current) {
                videoRef.current.pause()
                videoRef.current.srcObject = null
                connection.close()
                connection = null
            }
        })
    }

    /**
     * アンサーを送信する
     *
     * @param {RTCSessionDescription} offer
     * @return {void}
     */
    async function sendAnswer(offer: RTCSessionDescription) {
        // コネクションの設定
        const pcConfig = {
            // STUNサーバーはGoogle様のものを利用させていただく
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        }

        console.log(offer);
        

        // コネクションの作成
        const peer = new RTCPeerConnection(pcConfig)

        // コネクションを保存
        connection = peer

        // 配信イベントハンドラ的な？
        peer.ontrack = evt => {
            console.log('ontrack')

            // streamを設定
            if (videoRef.current) videoRef.current.srcObject = evt.streams[0]
        }

        // ICE candidateを取得イベントハンドラ
        peer.onicecandidate = evt => {
            // evt.candidateがnullならICE Candidateを全て取得したとみなしてアンサーを送信
            if (!evt.candidate)
                socket.emit('answer', { answer: peer.localDescription })
        }

        // コネクションの通信先としてオファーを設定
        await peer.setRemoteDescription(offer)

        // アンサーを作成
        const answer = await peer.createAnswer()

        // アンサーを自身に設定
        await peer.setLocalDescription(answer)
    }

    useEffect(() => {
        init()
    }, [])

    return <><video autoPlay ref={videoRef} onClick={handleClick}></video></>
}