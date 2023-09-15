import { FC, useEffect, useRef } from "react";

export const Live: FC = () => {
    /**
     * video取得
     * @type {HTMLVideoElement}
     */
    const videoRef = useRef<HTMLVideoElement>(null)
    const init = async () => {
        try {
            // PCカメラのstream取得
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    // width: cameraWidth,
                    // height: cameraHeight,
                    facingMode: "environment",
                },
                audio: true,
            })

            // streamをvideoにつなげる
            if (videoRef.current) videoRef.current.srcObject = stream
        } catch (e) {
            return
        }
    }

    useEffect(() => {
        init()
    }, [])

    return <>
        <video autoPlay ref={videoRef}></video>
    </>
}