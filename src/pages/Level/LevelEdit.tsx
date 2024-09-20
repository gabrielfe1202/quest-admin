import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { httpInstance } from '../../services/HttpRequest';
import { useParams } from 'react-router-dom';
import SwitcherFour from '../../components/Switchers/SwitcherFour';
import ProductOne from '../../images/product/product-01.png';
import ProductTwo from '../../images/product/product-02.png';
import ProductThree from '../../images/product/product-03.png';
import ProductFour from '../../images/product/product-04.png';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Content, ItemQuest, Question, nextItem } from '../../types/Questions';

type LevelEditParams = {
    id: string;
};


const productData: Product[] = [
    {
        image: ProductOne,
        name: 'Apple Watch Series 7',
        category: 'Electronics',
        price: 296,
        sold: 22,
        profit: 45,
    },
    {
        image: ProductTwo,
        name: 'Macbook Pro M1',
        category: 'Electronics',
        price: 546,
        sold: 12,
        profit: 125,
    },
    {
        image: ProductThree,
        name: 'Dell Inspiron 15',
        category: 'Electronics',
        price: 443,
        sold: 64,
        profit: 247,
    },
    {
        image: ProductFour,
        name: 'HP Probook 450',
        category: 'Electronics',
        price: 499,
        sold: 72,
        profit: 103,
    },
];
// Tipos de dados
interface Item {
    id: number;
    text: string;
}

const LevelEdit = () => {
    const { id } = useParams<LevelEditParams>();    
    const [title, setTitle] = useState<string>()
    const [active, setActive] = useState<boolean>()
    const [questions, setQuestions] = useState<Question[]>([])
    const [contents, setContents] = useState<Content[]>([])
    const [itemQuest, setItemQuest] = useState<nextItem[]>([])
    const [quests, setQuests] = useState<ItemQuest>()

    useEffect(() => {

        httpInstance
            .get(`/Level/infos/${id}`)
            .then((response) => {
                console.log(response.data)                
                setTitle(response.data.level.title)
                setActive(response.data.level.active)                                
                response.data.questions.map((item: any) => {
                    if(questions.filter(x => x.id === item.id).length === 0){
                        const quest = new Question(item.id)
                        quest.title = item.title
                        quest.nextContetId = item.nextContetId
                        quest.nextQuestionId = item.nextQuestionId
                        quest.previusContetId = item.previusContetId
                        quest.previusQuestionId = item.previusQuestionId
                        questions.push(quest)
                    }
                })                
                response.data.contents.map((item: any) => {
                    if(contents.filter(x => x.id === item.id).length === 0){
                        const cont = new Content(item.id)
                        cont.title = item.title
                        cont.text = item.text
                        cont.nextContetId = item.nextContetId
                        cont.nextQuestionId = item.nextQuestionId
                        cont.previusContetId = item.previusContetId
                        cont.previusQuestionId = item.previusQuestionId
                        contents.push(cont)
                    }
                })   
                if(questions.length > 0 && contents.length > 0){
                    const newQuest = new ItemQuest(questions,contents)                           
                    console.log(newQuest.getLinkedList())
                    setItemQuest(newQuest.getLinkedList())
                }
            })
            .catch((error) => {
                console.error("Erro ao buscar dados:", error);
            });

    }, [id])


    const sendEdit = () => {
        for(var i = 0; i < itemQuest.length;i++){
            let item = itemQuest[i]
            let next = itemQuest[i + 1] 
            let prev = itemQuest[i - 1] 
            if(i == 0){                
                if(item.type == 'question'){
                    item.quest.previusContetId = null
                    item.quest.previusQuestionId = null
                    if(next.type === 'question'){
                        item.quest.nextQuestionId = next.quest.id
                    }else{
                        item.quest.nextContetId = next.content.id
                    }
                }else{
                    item.content.previusContetId = null
                    item.content.previusQuestionId = null
                    if(next.type === 'question'){
                        item.content.nextQuestionId = next.quest.id
                    }else{
                        item.content.nextContetId = next.content.id
                    }
                }

                continue
            }else if (i === itemQuest.length - 1){
                if(item.type == 'question'){
                    item.quest.nextContetId = null
                    item.quest.nextQuestionId = null
                    if(prev.type === 'question'){
                        item.quest.previusQuestionId = prev.quest.id
                    }else{
                        item.quest.previusContetId = prev.content.id
                    }
                }else{
                    item.content.nextContetId = null
                    item.content.nextQuestionId = null
                    if(prev.type === 'question'){
                        item.content.previusQuestionId = prev.quest.id
                    }else{
                        item.content.previusContetId = prev.content.id
                    }
                }
                continue
            }   
            
            if(item.type == 'question'){
                if(next.type === 'question'){
                    item.quest.nextQuestionId = next.quest.id
                }else{
                    item.quest.nextContetId = next.content.id
                }
                if(prev.type === 'question'){
                    item.quest.previusQuestionId = prev.quest.id
                }else{
                    item.quest.previusContetId = prev.content.id
                }
            }else{
                if(next.type == 'question'){
                    item.content.nextQuestionId = next.quest.id
                }else{
                    item.content.nextContetId = next.content.id
                }
                
                if(prev.type === 'question'){
                    item.content.previusQuestionId = prev.quest.id
                }else{
                    item.content.previusContetId = prev.content.id
                }
            }       
        }

        console.log(itemQuest)

        httpInstance
            .put(`/Level/Edit/${id}`, {
                title: title,
                active: active
            })
            .then((response) => {
                console.log(response)
            })
    }

    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index);
    };

    const handleDrop = (index: number) => {
        if (draggedItemIndex !== null) {
            const updatedItems = [...itemQuest];
            const [draggedItem] = updatedItems.splice(draggedItemIndex, 1);
            updatedItems.splice(index, 0, draggedItem);
            setItemQuest(updatedItems);
            console.log('Lista reordenada:', updatedItems); // Console.log da lista reordenada
            setDraggedItemIndex(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <>
            <Breadcrumb pageName="Levels Edit" />



            <div className="grid grid-cols-1 gap-9 ">
                <div className="flex flex-col gap-9">
                    {/* <!-- Input Fields --> */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Input Fields
                            </h3>
                        </div>
                        <div className="flex flex-col gap-5.5 p-6.5">
                            <div>
                                <label className="mb-3 block text-black dark:text-white" htmlFor='title'>
                                    Default Input
                                </label>
                                <input
                                    type="text"
                                    id='title'
                                    placeholder="Default Input"
                                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    value={title}
                                    onChange={(t) => setTitle(t.target.value)}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="toggle4"
                                    className="flex cursor-pointer select-none items-center"
                                >
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="toggle4"
                                            className="sr-only"
                                            onChange={() => {
                                                setActive(!active)
                                            }}
                                        />
                                        <div className="block h-8 w-14 rounded-full bg-black" />
                                        <div
                                            className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${active && '!right-1 !translate-x-full'
                                                }`}
                                        />
                                    </div>
                                </label>
                            </div>

                            <button
                                type='button'
                                className='w-40 inline-flex items-center text-lg justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10'
                                onClick={sendEdit}
                            >
                                envia
                            </button>
                        </div>
                    </div>

                </div>

                <div className="flex flex-col gap-9">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="py-6 px-4 md:px-6 xl:px-7.5">
                            <h4 className="text-xl font-semibold text-black dark:text-white">
                                Questions & contents
                            </h4>
                        </div>

                        <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                            <div className="col-span-3 flex items-center">
                                <p className="font-medium">Title</p>
                            </div>
                            <div className="col-span-2 hidden items-center sm:flex">
                                <p className="font-medium">Category</p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="font-medium">Price</p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="font-medium">Sold</p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="font-medium">Profit</p>
                            </div>
                        </div>

                        {itemQuest.map((item, key) => (
                            <div
                                className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                key={key}
                                draggable
                                onDragStart={() => handleDragStart(key)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(key)}
                            >
                                <div className="col-span-3 flex items-center">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">                                        
                                        <p className="text-sm text-black dark:text-white">
                                            {item.type === 'question' ? item.quest.title : item.content.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-2 hidden items-center sm:flex">
                                    <p className="text-sm text-black dark:text-white">
                                        aa
                                    </p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-black dark:text-white">
                                        cc
                                    </p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-black dark:text-white">dd</p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-meta-3">ee</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
};

export default LevelEdit;
