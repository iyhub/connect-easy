import {sendToBackground} from "@plasmohq/messaging";
import {useEffect, useState} from "react";

const SidePanel = () => {
    const [content, setContent] = useState(null)
    const [textContent, setTextContent] = useState("")
    const [title, setTitle] = useState("")
    const [nickname, setNickname] = useState("")
    const [userId, setUerId] = useState("")

    function getElementByXPath(data:Node,xpath:string) {
        return document.evaluate(xpath, data, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    const getContent = async () => {
        const data = await sendToBackground({
            name: "get-content",
            body: null
        })
        console.log("get content data",data)
        setTitle(data.data.title)
        setContent(data.data.content)
        let tempNode = document.createElement('div');
        tempNode.innerHTML = data.data.content;

        //  //*[@id="readability-page-1"]/div/section/div/div[1]/article/div/div[2]/div[1]
        let node = getElementByXPath(tempNode,"//*[@id=\"readability-page-1\"]/div/section/div/div[1]/article/div/div[2]/div[1]");
        let nick = getElementByXPath(tempNode,"//*[@id=\"id__nsb4k03hn1q\"]/div[1]/a/div/p/span/span");


        console.log("node===>:",node)
        setTextContent(node.textContent)


        return data
    }

    function getText(dom:any, exp:string) {
        // 获取匹配选择器的元素
        const elements = dom.querySelectorAll(exp);
        console.log("elements:",elements)
    }


    useEffect(() => {
        let textContent = document.body.textContent;
        setTextContent(textContent)
    }, []);

    return (
        <div>
            <h1>This is SidePanel</h1>
            <h2>This is SidePanel</h2>
            <button onClick={getContent}>Load</button>
            <p>title:{title}<br/></p>
            <p>[正文]:{textContent}<br/></p>
            <p>content:{JSON.stringify(content)}<br/></p>


            {/*text:{textContent}*/}
        </div>
    );
}
export default SidePanel
