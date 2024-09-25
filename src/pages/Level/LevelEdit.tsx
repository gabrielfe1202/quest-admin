import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faChevronDown, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { httpInstance } from '../../services/HttpRequest';
import { useNavigate, useParams } from 'react-router-dom';
// biome-ignore lint/style/useImportType: <explanation>
import { Content, ItemQuest, Option, Question, nextItem } from '../../types/Questions';
import Modal from '../../components/Modal';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type LevelEditParams = {
    id: string;
};


const LevelEdit = () => {
    const { id } = useParams<LevelEditParams>();
    const [title, setTitle] = useState<string>()
    const [active, setActive] = useState<boolean>()
    const [order, setOrder] = useState<number>(0)
    const [questions] = useState<Question[]>([])
    const [contents] = useState<Content[]>([])
    const [itemQuest, setItemQuest] = useState<nextItem[]>([])
    const [questEditTitle, setQuesEditTitle] = useState<string>('')
    const [currentEditQuest, setCurrentEditQuest] = useState<Question>()
    const [currentEditoptions, setCurrentEditoptions] = useState<Option[]>([])
    const [currentTitleptions, setCurrentTitleptions] = useState<string>()
    const [questEditType, setQuesEditType] = useState<string>('')
    const [currentOptionIndex, setCurrentOptionIndex] = useState<number | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
    const [reorderQuests, setReorderQuests] = useState<boolean>(false)
    const [alter, setAlter] = useState<boolean>(false)
    const navigate = useNavigate()

    const changeTextColor = () => {
        setIsOptionSelected(true);
    };


    async function loadDataLevel(){
    
        httpInstance
        .get(`/Level/infos/${id}`)
        .then(async (response) => {
            console.log(response.data)
            setTitle(response.data.level.title)
            setActive(response.data.level.active)
            setOrder(response.data.level.order)
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            await response.data.questions.map((item: any) => {
                if (questions.filter(x => x.id === item.id).length === 0) {
                    const quest = new Question(item.id)
                    const opts: Option[] = []
                    quest.title = item.title
                    quest.type = item.type
                    quest.nextContetId = item.nextContetId
                    quest.nextQuestionId = item.nextQuestionId
                    quest.previusContetId = item.previusContetId
                    quest.previusQuestionId = item.previusQuestionId

                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                    item.options.map((opt: any) => {
                        opts.push(new Option(opt))
                    })

                    quest.options = opts

                    questions.push(quest)
                }
            })
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            await response.data.contents.map((item: any) => {
                if (contents.filter(x => x.id === item.id).length === 0) {
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
            if (questions.length > 0 && contents.length > 0) {
                const newQuest = new ItemQuest(questions, contents)
                console.log(newQuest.getLinkedList())
                setItemQuest(newQuest.getLinkedList())
            }
        })
        .catch((error) => {
            console.error("Erro ao buscar dados:", error);
        });    

    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {

        loadDataLevel()

    }, [id])

    const sendEdit = () => {
        for (let i = 0; i < itemQuest.length; i++) {
            const item = itemQuest[i]
            const next = itemQuest[i + 1]
            const prev = itemQuest[i - 1]
            if (i === 0) {
                if (item.type === 'question') {
                    item.quest.previusContetId = null
                    item.quest.previusQuestionId = null
                    if (next.type === 'question') {
                        item.quest.nextQuestionId = next.quest.id
                    } else {
                        item.quest.nextContetId = next.content.id
                    }
                } else {
                    item.content.previusContetId = null
                    item.content.previusQuestionId = null
                    if (next.type === 'question') {
                        item.content.nextQuestionId = next.quest.id
                    } else {
                        item.content.nextContetId = next.content.id
                    }
                }

                continue
                // biome-ignore lint/style/noUselessElse: <explanation>
            } else if (i === itemQuest.length - 1) {
                if (item.type === 'question') {
                    item.quest.nextContetId = null
                    item.quest.nextQuestionId = null
                    if (prev.type === 'question') {
                        item.quest.previusQuestionId = prev.quest.id
                    } else {
                        item.quest.previusContetId = prev.content.id
                    }
                } else {
                    item.content.nextContetId = null
                    item.content.nextQuestionId = null
                    if (prev.type === 'question') {
                        item.content.previusQuestionId = prev.quest.id
                    } else {
                        item.content.previusContetId = prev.content.id
                    }
                }
                continue
            }
            if (item.type === 'question') {
                item.quest.nextContetId = null
                item.quest.nextQuestionId = null
                item.quest.previusContetId = null
                item.quest.previusQuestionId = null
                if (next.type === 'question') {
                    item.quest.nextQuestionId = next.quest.id
                } else {
                    item.quest.nextContetId = next.content.id
                }
                if (prev.type === 'question') {
                    item.quest.previusQuestionId = prev.quest.id
                } else {
                    item.quest.previusContetId = prev.content.id
                }
            } else {
                item.content.nextContetId = null
                item.content.nextQuestionId = null
                item.content.previusContetId = null
                item.content.previusQuestionId = null
                if (next.type === 'question') {
                    item.content.nextQuestionId = next.quest.id
                } else {
                    item.content.nextContetId = next.content.id
                }
                if (prev.type === 'question') {
                    item.content.previusQuestionId = prev.quest.id
                } else {
                    item.content.previusContetId = prev.content.id
                }
            }
        }

        console.log(itemQuest)

        httpInstance
            .put(`/Level/Edit/${id}`, {
                title,
                active,
                order,
                reorderQuests,
                questions: itemQuest
            })
            .then(() => {
                toast.success('Level edited successfully', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
                setAlter(false)
            }).catch(() => {

            })
    }

    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);


    const onDragStart = (key: number) => {
        handleDragStart(key);
        setIsDragging(true);
    };

    const onDragEnd = () => {
        setIsDragging(false);
        setDragOverIndex(null); // Remove o estado de drag over quando o drag terminar
    };

    const onDragOver = (event: React.DragEvent<HTMLDivElement>, index: number) => {
        event.preventDefault();
        handleDragOver(event);
        setDragOverIndex(index); // Seta o índice atual como o lugar onde o item está sendo arrastado
    };


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
            setReorderQuests(true)
            setAlter(true)
        }
        setDragOverIndex(null);
    };


    const handleDropOption = (index: number) => {
        if (draggedItemIndex !== null && currentEditQuest?.options !== undefined) {
            const updatedItems = [...currentEditQuest.options];
            const [draggedItem] = updatedItems.splice(draggedItemIndex, 1);
            updatedItems.splice(index, 0, draggedItem);
            setCurrentEditoptions(updatedItems)
            console.log('Lista reordenada:', updatedItems); // Console.log da lista reordenada
            setDraggedItemIndex(null);
        }
        setDragOverIndex(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentOptionIndex(null)
        setIsModalOpen(false);
    };

    function editQuest(quest: Question) {
        setCurrentEditQuest(quest)
        setQuesEditTitle(quest.title)
        setQuesEditType(quest.type)
        setCurrentEditoptions(quest.options)
        openModal()
    }

    function sendQuest() {
        if (currentEditQuest?.id === "") {
            httpInstance.post('/Question', {
                title: questEditTitle,
                type: questEditType,
                levelId: id,
                options: currentEditoptions
            }).then((response) => {                
                console.log(response.data)
                const quest: Question = new Question(response.data.question[0].id)                
                quest.title = response.data.question[0]?.title
                quest.type = response.data.question[0]?.type
                quest.nextContetId = response.data.question[0]?.nextContetId                
                quest.nextQuestionId = response.data.question[0]?.nextQuestionId                
                quest.previusContetId = response.data.question[0]?.previusContetId                
                quest.previusQuestionId = response.data.question[0]?.previusQuestionId                
                const newItem: nextItem = { type: 'question', quest: quest }
                setItemQuest(() => [...itemQuest,newItem])
                console.log('cc')
                closeModal()
            }).catch(() => { })
        }else{
            httpInstance.put('/Question', {
                id: currentEditQuest?.id,
                title: questEditTitle,
                type: questEditType,
                levelId: id,
                options: currentEditoptions
            }).then((response) => {                
                console.log(response)                
                loadDataLevel()
                closeModal()
            }).catch(() => { })
        }
    }

    function deleteQuest(id: string){
        httpInstance.delete(`/Question/${id}`).then((response) => {
            setItemQuest(() => itemQuest.filter(x => x.type === 'question' ? x.quest.id !== id : true ))
        }).catch((error)  => {
            console.log(error)
        })
    }

    function addQuestOption() {
        setCurrentEditoptions((prev) => [...prev, new Option({ id: '0', points: 0, title: 'change me' })])
    }

    function editOpton(key: number) {
        setCurrentOptionIndex(key)
        setCurrentTitleptions(currentEditoptions[key].title)
    }

    function changeOption() {
        if (currentOptionIndex !== null) {
            const op = currentEditoptions[currentOptionIndex]
            httpInstance.post('/Option', {
                id: op.id,
                title: currentTitleptions,
                questionId: currentEditQuest?.id
            }).then((response) => {
                console.log(response)
                httpInstance.get(`/Options/${currentEditQuest?.id}`).then((data) => {
                    console.log(data.data.options)
                    setCurrentEditoptions(data.data.options)
                    setCurrentOptionIndex(null)
                })
            })
        }
    }


    return (
        <>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"

            />

            <Breadcrumb pageName="Levels Edit" />



            <div className="grid grid-cols-1 gap-9 ">
                <div className="flex flex-col gap-9">
                    {/* <!-- Input Fields --> */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="flex flex-col gap-5.5 p-6.5">
                            <div className='grid grid-cols-2 gap-12'>
                                <div>
                                    <label className="mb-3 block text-black dark:text-white" htmlFor='title'>
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id='title'
                                        placeholder="Default Input"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        value={title}
                                        onChange={(t) => { setTitle(t.target.value); setAlter(true) }}
                                    />

                                </div>
                                <div>
                                    <label className="mb-3 block text-black dark:text-white" htmlFor='title'>
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        id='order'
                                        placeholder="Default Input"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        value={order}
                                        onChange={(t) => { setOrder(Number.parseInt(t.target.value)); setAlter(true) }}
                                    />
                                </div>
                            </div>


                            <div className="flex flex-col gap-9">
                                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                                    <div className="flex flex-row justify-between py-6 px-4 md:px-6 xl:px-7.5">
                                        <h4 className="text-xl font-semibold text-black dark:text-white">
                                            Questions & contents
                                        </h4>

                                        <div className='flex flex-row gap-4'>
                                            <button
                                                type='button'
                                                className='inline-flex items-center text-lg justify-center rounded-full bg-primary py-1 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:opacity-75 text-md'
                                                onClick={() => { openModal(); setCurrentEditQuest(new Question("")); setCurrentEditoptions([]); setQuesEditTitle(''); setQuesEditType('') }}
                                            >
                                                Add quest
                                            </button>


                                            <button
                                                type='button'
                                                className='inline-flex items-center text-lg justify-center rounded-full bg-primary py-1 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:opacity-75 text-md'
                                                onClick={() => { }}
                                            >
                                                Add content
                                            </button>

                                        </div>
                                    </div>

                                    <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                                        <div className="col-span-3 flex items-center">
                                            <p className="font-medium">Title</p>
                                        </div>
                                        <div className="col-span-2 hidden items-center sm:flex">
                                            <p className="font-medium">Options</p>
                                        </div>
                                        <div className="col-span-1 flex items-center">
                                            <p className="font-medium">Type</p>
                                        </div>
                                        <div className="col-span-1 flex items-center">
                                            <p className="font-medium">Actions</p>
                                        </div>
                                    </div>

                                    {itemQuest.map((item, key) => (
                                        <div
                                            className={`grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5 ${isDragging ? 'opacity-50' : 'opacity-100'
                                                } ${dragOverIndex !== null ? 'border-dashed border-4 border-blue-500' : ''}`}
                                            key={key.toString()}
                                            draggable
                                            onDragStart={() => onDragStart(key)}
                                            onDragEnd={onDragEnd}
                                            onDragOver={(e) => onDragOver(e, key)}
                                            onDrop={() => handleDrop(key)}
                                        >
                                            {item.type === 'question' ? (
                                                <>
                                                    <div className="col-span-3 flex items-center">
                                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                            <p className="text-sm text-black dark:text-white">
                                                                {item.quest.title}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 hidden items-center sm:flex">
                                                        <p className="text-sm text-black dark:text-white">
                                                            {item.quest.options.length}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-1 flex items-center">
                                                        <p className="text-sm text-black dark:text-white">
                                                            {item.quest.type}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-1 flex items-center">
                                                        <div className="flex items-center space-x-3.5">
                                                            <button type='button' className="hover:text-primary" onClick={() => { editQuest(item.quest) }}>
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button type='button' className="hover:text-primary" onClick={() => deleteQuest(item.quest.id)}>
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="col-span-3 flex items-center">
                                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                            <p className="text-sm text-black dark:text-white">
                                                                {item.content.title}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 hidden items-center sm:flex">
                                                        <p className="text-sm text-black dark:text-white">
                                                            -
                                                        </p>
                                                    </div>
                                                    <div className="col-span-1 flex items-center">
                                                        <p className="text-sm text-black dark:text-white">
                                                            Content
                                                        </p>
                                                    </div>
                                                    <div className="col-span-1 flex items-center">
                                                        <div className="flex items-center space-x-3.5">
                                                            <button type='button' className="hover:text-primary" onClick={() => { }}>
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button type='button' className="hover:text-primary">
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div className='flex flex-row justify-start gap-4'>
                                <button
                                    type='button'
                                    className='w-40 inline-flex items-center text-lg justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:opacity-75'
                                    onClick={sendEdit}
                                    disabled={!alter}
                                >
                                    Save
                                </button>

                                <button
                                    type='button'
                                    className='w-40 inline-flex items-center text-lg justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:opacity-75'
                                    onClick={() => navigate(`/Level/Publish/${id}`)}
                                    disabled={alter}
                                >
                                    Publish
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2 className="text-xl font-bold mb-4">Edit question</h2>
                <div className=''>
                    <label className="mb-1 block text-black dark:text-white" htmlFor=''>
                        Type
                    </label>

                    <div className="relative z-20 bg-white dark:bg-form-input dark:text-white">
                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                            <FontAwesomeIcon icon={faBox} />
                        </span>

                        <select
                            value={questEditType}
                            onChange={(e) => {
                                setQuesEditType(e.target.value)
                                changeTextColor();
                            }}
                            className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-12 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''}`}
                        >
                            <option value="" disabled className="text-body dark:text-bodydark">
                                Select Type
                            </option>
                            <option value="singleOption" className="text-body dark:text-bodydark">
                                Single Option
                            </option>
                            <option value="multipeOption" className="text-body dark:text-bodydark">
                                Multiple Option
                            </option>
                            <option value="game" className="text-body dark:text-bodydark">
                                Game 7 errors
                            </option>
                        </select>

                        <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2 dark:text-white">
                            <FontAwesomeIcon icon={faChevronDown} className='dark:text-white' />
                        </span>
                    </div>

                    <div>

                        <label className="mb-1 mt-4 block text-black dark:text-white" htmlFor=''>
                            Question
                        </label>

                        <input
                            type="text"
                            placeholder="Default Input"
                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={questEditTitle}
                            onChange={(e) => { setQuesEditTitle(e.target.value) }}
                        />
                    </div>

                    {currentEditQuest !== undefined && currentEditQuest?.id.length > 5 && (
                        <div className="flex flex-col gap-4 mt-8 justify-end items-end">
                            <div className="rounded-sm w-full border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                                <div className="flex flex-row justify-between py-2 px-4 md:px-4 xl:px-5">
                                    <h4 className="text-lg font-semibold text-black dark:text-white">
                                        Options
                                    </h4>

                                    <div>
                                        <button
                                            type='button'
                                            className='inline-flex items-center text-lg justify-center rounded-full bg-primary py-1 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:opacity-75 text-md'
                                            onClick={() => addQuestOption()}
                                        >
                                            Add option
                                        </button>

                                    </div>
                                </div>

                                <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                                    <div className="col-span-3 flex items-center">
                                        <p className="font-medium">Title</p>
                                    </div>
                                    <div className="col-span-2 hidden items-center sm:flex">
                                        <p className="font-medium">Correct</p>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        <p className="font-medium">Points</p>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        <p className="font-medium">Actions</p>
                                    </div>
                                </div>

                                {currentEditoptions.map((item, key) => {

                                    return (
                                        <>
                                            <div
                                                className={`grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5 ${isDragging ? 'opacity-50' : 'opacity-100'
                                                    } ${dragOverIndex !== null ? 'border-dashed border-4 border-blue-500' : ''}`}
                                                key={key.toString()}
                                                draggable
                                                onDragStart={() => onDragStart(key)}
                                                onDragEnd={onDragEnd}
                                                onDragOver={(e) => onDragOver(e, key)}
                                                onDrop={() => handleDropOption(key)}
                                            >
                                                <div className="col-span-3 flex items-center">
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                        <p className="text-sm text-black dark:text-white">
                                                            {item.title}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 hidden items-center sm:flex">
                                                    <p
                                                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${item.correct
                                                            ? 'bg-success text-success'
                                                            : 'bg-danger text-danger'}`}
                                                    >
                                                        {item.correct ? "True" : "False"}
                                                    </p>
                                                </div>
                                                <div className="col-span-1 flex items-center">
                                                    <p className="text-sm text-black dark:text-white">
                                                        {item.points}
                                                    </p>
                                                </div>
                                                <div className="col-span-1 flex items-center">
                                                    <div className="flex items-center space-x-3.5">
                                                        <button type='button' className="hover:text-primary" onClick={() => { editOpton(key) }}>
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </button>
                                                        <button type='button' className="hover:text-primary">
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {currentOptionIndex === key && (
                                                <div className='p-6 border-solid border-t-[1.5px] border-stroke relative'>

                                                    <button
                                                        type='button'
                                                        className="absolute top-3 right-5 text-gray-600 font-bold hover:text-gray-800"
                                                        onClick={() => { setCurrentOptionIndex(null) }}
                                                    >
                                                        &#10005;
                                                    </button>

                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <div className=''>
                                                            <label className="mb-1 block text-black dark:text-white" htmlFor=''>
                                                                Label
                                                            </label>

                                                            <input
                                                                type="text"
                                                                placeholder="Default Input"
                                                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                                                value={currentTitleptions}
                                                                onChange={(e) => setCurrentTitleptions(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className=''>
                                                            <label className="mb-1 block text-black dark:text-white" htmlFor=''>
                                                                Poits
                                                            </label>

                                                            <input
                                                                type="text"
                                                                placeholder="Default Input"
                                                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                                                value={item.points}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        className='w-24 mt-5 inline-flex items-center text-lg justify-center rounded-full bg-primary py-1 px-12 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10'
                                                        onClick={() => { changeOption() }}
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )
                                })}

                            </div>

                        </div>
                    )}
                    <button
                        type='button'
                        className='w-32 float-end mt-2 inline-flex items-center text-lg justify-center rounded-full bg-primary py-3 px-12 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10'
                        onClick={() => { sendQuest() }}
                    >
                        Save
                    </button>
                </div>
            </Modal>





        </>
    );
};

export default LevelEdit;
