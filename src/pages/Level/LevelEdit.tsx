import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faChevronDown, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { httpInstance } from '../../services/HttpRequest';
import { useParams } from 'react-router-dom';
// biome-ignore lint/style/useImportType: <explanation>
import { Content, ItemQuest, Option, Question, nextItem } from '../../types/Questions';
import Modal from '../../components/Modal';

type LevelEditParams = {
    id: string;
};


const LevelEdit = () => {
    const { id } = useParams<LevelEditParams>();
    const [title, setTitle] = useState<string>()
    const [active, setActive] = useState<boolean>()
    const [questions, setQuestions] = useState<Question[]>([])
    const [contents, setContents] = useState<Content[]>([])
    const [itemQuest, setItemQuest] = useState<nextItem[]>([])
    const [quests, setQuests] = useState<ItemQuest>()
    const [currentEditQuest, setCurrentEditQuest] = useState<Question>()
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [currentOptionIndex, setCurrentOptionIndex] = useState<number | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

    const changeTextColor = () => {
        setIsOptionSelected(true);
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {

        httpInstance
            .get(`/Level/infos/${id}`)
            .then((response) => {
                console.log(response.data)
                setTitle(response.data.level.title)
                setActive(response.data.level.active)
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                response.data.questions.map((item: any) => {
                    if (questions.filter(x => x.id === item.id).length === 0) {
                        const quest = new Question(item.id)
                        const opts: Option[] = []
                        quest.title = item.title
                        quest.nextContetId = item.nextContetId
                        quest.nextQuestionId = item.nextQuestionId
                        quest.previusContetId = item.previusContetId
                        quest.previusQuestionId = item.previusQuestionId

                        item.options.map((opt: any) => {
                            opts.push(new Option(opt))
                        })

                        quest.options = opts

                        questions.push(quest)
                    }
                })
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                response.data.contents.map((item: any) => {
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
                title: title,
                active: active,
                questions: itemQuest
            })
            .then((response) => {
                console.log(response)
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
        }
        setDragOverIndex(null);
    };

    
    const handleDropOption = (index: number) => {
        if (draggedItemIndex !== null) {
            //const updatedItems = [...itemQuest];
            //const [draggedItem] = updatedItems.splice(draggedItemIndex, 1);
            //updatedItems.splice(index, 0, draggedItem);
            //setItemQuest(updatedItems);
            //console.log('Lista reordenada:', updatedItems); // Console.log da lista reordenada
            //setDraggedItemIndex(null);
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
        openModal()
    }

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
                                        <div className={`block h-8 w-14 rounded-full bg-black ${active && 'bg-green-600'}`} />
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
                                <p className="font-medium">Options</p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="font-medium">Views</p>
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
                                                20
                                            </p>
                                        </div>
                                        <div className="col-span-1 flex items-center">
                                            <div className="flex items-center space-x-3.5">
                                                <button type='button' className="hover:text-primary" onClick={() => { editQuest(item.quest) }}>
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button type='button' className="hover:text-primary">
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
                                                0
                                            </p>
                                        </div>
                                        <div className="col-span-1 flex items-center">
                                            <p className="text-sm text-black dark:text-white">
                                                20
                                            </p>
                                        </div>
                                        <div className="col-span-1 flex items-center">
                                            <div className="flex items-center space-x-3.5">
                                                <button type='button' className="hover:text-primary" onClick={openModal}>
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

            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2 className="text-xl font-bold mb-4">Edit question</h2>
                <div>
                    <label className="mb-1 block text-black dark:text-white" htmlFor=''>
                        Type
                    </label>

                    <div className="relative z-20 bg-white dark:bg-form-input">
                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                            <FontAwesomeIcon icon={faBox} />
                        </span>

                        <select
                            value={currentEditQuest?.type}
                            onChange={(e) => {
                                currentEditQuest?.setType(e.target.value)
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

                        <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                            <FontAwesomeIcon icon={faChevronDown} />
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
                            value={currentEditQuest?.title}
                            onChange={(e) => {currentEditQuest?.setTitle(e.target.value)}}
                        />
                    </div>


                    <div className="flex flex-col gap-9 mt-8">
                        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                            <div className="py-2 px-4 md:px-4 xl:px-5">
                                <h4 className="text-lg font-semibold text-black dark:text-white">
                                    Options
                                </h4>
                            </div>

                            <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                                <div className="col-span-3 flex items-center">
                                    <p className="font-medium">Title</p>
                                </div>
                                <div className="col-span-2 hidden items-center sm:flex">
                                    <p className="font-medium">Options</p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="font-medium">Views</p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="font-medium">Actions</p>
                                </div>
                            </div>

                            {currentEditQuest?.options.map((item, key) => {
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
                                                <p className="text-sm text-black dark:text-white">
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
                                                    <button type='button' className="hover:text-primary" onClick={() => { setCurrentOptionIndex(key) }}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button type='button' className="hover:text-primary">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {currentOptionIndex === key && (
                                            <div className='p-6 border-solid border-t-[1.5px] border-stroke'>
                                                <div className='grid grid-cols-2 gap-4'>
                                                    <div className=''>
                                                        <label className="mb-1 block text-black dark:text-white" htmlFor=''>
                                                            Label
                                                        </label>

                                                        <input
                                                            type="text"
                                                            placeholder="Default Input"
                                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                                            value={item.title}
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
                                                    onClick={() => {}}
                                                >
                                                    envia
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )
                            })}
                        </div>
                    </div>

                </div>
            </Modal>





        </>
    );
};

export default LevelEdit;
