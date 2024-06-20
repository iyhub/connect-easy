import {useEffect, useState} from "react";
import cssText from "data-text:~style.css"
import "~/style.css"
import ollama from 'ollama'
import { Storage } from "@plasmohq/storage"




const prompt_zh = `
你的任务是执行中英文翻译,你将翻译用户输入的文本.你将遵循以下原则:
1.你的任务是执行翻译,不再具备对话功能,你只需要返回最终翻译结果.禁止返回其他内容!
2.翻译结果必须符合规范,不能出现错别字,不能出现语法错误,符合语言习惯.
3.直接给出翻译内容,*禁止掺杂其他内容,禁止扩写内容,禁止使用'"'来引用翻译结果*
4.用户输入中文,你将返回英文,需要符合美式英文习惯,且不能丢失原本意思.
5.用户输入英文,你将返回中文,需要符合中文习惯,且不能丢失原本意思.
6.在给出前请先检查翻译结果,确保翻译结果符合规范.
7.输出格式:翻译结果
`

const prompt_zh_v1 = `
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


const storage = new Storage()
const SidePanel = () => {
    const [orgText, setOrgText] = useState("")
    const [loading, setLoading] = useState(false)
    const [historyList, setHistoryList] = useState([])
    const [output, setOutput] = useState<string>('');
    const [models, setModels] = useState<any[]>(null)

    const [model, setModel] = useState<any>("llama3:latest")


    useEffect(() => {
        initHistory()
        initModels()
    }, []);

    const initHistory = async () => {
        const history:any[] = await storage.get("historyList");
        setHistoryList(history)
    }
    const initModels = async () => {
        let list = await ollama.list();
        console.log("models",list)
        setModels(list.models)
    }

    const clearHistory = async () => {
        await storage.set("historyList",[])
        setHistoryList([])
    }

    const doTranslate = async () => {
        let history:any[] = await storage.get("historyList");
        console.log("historyList",history)
        setLoading(true)
        setOutput("")
        if(history){
            history.unshift({ orgText: orgText ,id:Date.now().toString()})
        }else{
            history = [{ orgText: orgText ,id:Date.now().toString()}]
        }
        setHistoryList(history)
        const result = await ollama.generate({
            model: model,
            prompt:orgText,
            system:prompt_zh,
            stream:true
        })

        for await (const chunk of result) {
            let response = chunk.response;
            setOutput((prevOutput) => prevOutput + response);
        }
        setLoading(false)
    }



    const doCopy = () =>{
        navigator.clipboard.writeText(output)
    }

    return (
        <div className={'flex flex-col bg-gray-400/50 h-screen px-4 py-8 space-y-2'}>

            <h1 className={'text-3xl font-bold'}>Connect So Easy </h1>
            <p className={'font-thin text-amber-800'}>* base Ollama server localy [{model}]</p>

            <div className={'flex space-x-2'}>
                <div className={'flex gap-2'}>
                    <label htmlFor="fromLang">本地大模型:</label>
                    {models &&
                        <select name="fromLang" id="fromLang" className={'rounded-md'} defaultValue={model}
                                onChange={(e) => {
                                    setModel(e.target.value)
                                }}>
                            {models.map(item=>(
                                <option key={item.name} value={item.name}>{item.name}</option>
                            ))}

                        </select>
                    }
                </div>


            </div>
            <div className={'flex flex-col space-y-1'}>
                <span>待翻译:</span>
                <textarea value={orgText} className={'h-36 rounded-md p-1 font-medium outline-0'}
                          onChange={(v) => {
                              setOrgText(v.target.value)
                          }}
                          placeholder='输入中文会被翻译成英文,输入英文会翻译为中文,请确保你本地启动了Ollama.'></textarea>
            </div>
            <div className={'flex w-full items-center justify-start space-x-1'}>
            <button onClick={doTranslate} className={'rounded-md bg-sky-600 h-8 text-white px-2 hover:bg-sky-500 cursor-pointer'}
                        >Translate
                </button>
                <button onClick={doCopy} className={'rounded-md bg-green-600 h-8 text-white px-4 hover:bg-green-500 cursor-pointer'}>Copy
                </button>
                {loading && <span>Loading...</span>}
            </div>

            <div className={'flex flex-col space-y-1'}>
                <span>翻译结果:</span>
                <textarea value={output} className={'h-96 rounded-md p-1 outline-0'} readOnly={true}
                          placeholder={'翻译结果将会显示在这里'}></textarea>

            </div>

            <div className={'flex flex-col space-y-1'}>
                <div className={'flex items-center'}>
                    <span>翻译历史:</span>
                    <button onClick={clearHistory}
                            className={'rounded-md bg-red-400 text-white px-1 hover:bg-red-400'}>Clean
                    </button>
                </div>
                <div className={'h-32 rounded-md p-1 outline-0 flex flex-col space-y-1 overflow-y-scroll py-4'}>
                {historyList.map(item=>(
                        <span key={item.id} onClick={()=>{setOrgText(item.orgText)}} className={'w-full max-w-96 py-1 px-4 overflow-x-clip bg-gray-500/50 rounded-md text-white/60'}>{item.orgText}</span>
                    ))}
                </div>
            </div>

        </div>
    );
}
export default SidePanel
