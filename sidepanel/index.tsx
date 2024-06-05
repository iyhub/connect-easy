import {useEffect, useState} from "react";
import cssText from "data-text:~style.css"
import "~/style.css"
import ollama from 'ollama'


const prompt_zh = `
你的任务是执行中英文翻译,你将翻译用户输入的文本.你将遵循以下原则:
1.用户输入中文,你将返回英文,需要符合美式英文习惯,且不能丢失原本意思.
2.用户输入英文,你将返回中文,需要符合中文习惯,且不能丢失原本意思.
3.翻译结果必须符合规范,不能出现错别字,不能出现语法错误,符合语言习惯.
4.你只需要返回最终翻译结果.禁止返回其他内容!
5.输出格式:{"transResult":#{transResult}}
`



export const getStyle = () => {
    const style = document.createElement("style")
    style.textContent = cssText
    return style
}

const SidePanel = () => {
    const [orgText, setOrgText] = useState("")
    const [resultText, setResultText] = useState("")
    const [loading, setLoading] = useState(false)


    const doTranslate = async () => {
        setLoading(true)
        const result = await ollama.generate({
            // model: 'llama3',
            model:"qwen:7b",
            prompt:`\`\`\`${orgText}\`\`\``,
            system:prompt_zh,
            format: "json",
        })

        console.log("trans:",result)
        let json = JSON.parse(result.response.trim());
        setResultText(json.transResult)
        setLoading(false)
    }
    const doCopy = () =>{
        navigator.clipboard.writeText(resultText)
    }

    return (
        <div className={'flex flex-col bg-gray-400/50 h-screen px-4 py-8 space-y-2'}>

            <h1 className={'text-3xl font-bold'}>Connect So Easy</h1>
            <p className={'font-thin text-amber-800'}>* base Ollama server localy</p>
            <div className={'flex flex-col space-y-1'}>
                <span>待翻译:</span>
                <textarea value={orgText} className={'h-36 rounded-md p-1 font-medium outline-0'}
                          onChange={(v) => {
                              setOrgText(v.target.value)
                          }} placeholder='输入中文会被翻译成英文,输入英文会翻译为中文,请确保你本地启动了Ollama.'></textarea>
            </div>
            <div className={'flex w-full items-center justify-start space-x-1'}>
                <button onClick={doTranslate} className={'rounded-md bg-sky-600 h-8 text-white px-2 hover:bg-sky-500'}
                        disabled={loading}>Translate
                </button>
                <button onClick={doCopy} className={'rounded-md bg-green-600 h-8 text-white px-4 hover:bg-green-500'}>Copy
                </button>
            </div>

            <div className={'flex flex-col space-y-1'}>
                <span>结果:</span>
                <textarea value={resultText} className={'h-96 rounded-md p-1 outline-0'} readOnly={true}
                          onChange={(v) => {
                              setResultText(v.target.value)
                          }} placeholder={'翻译结果将会显示在这里'}></textarea>
            </div>

        </div>
    );
}
export default SidePanel
