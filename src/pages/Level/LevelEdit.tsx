import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { httpInstance } from '../../services/HttpRequest';
import { useParams } from 'react-router-dom';
// biome-ignore lint/style/useImportType: <explanation>
import { Content, ItemQuest, Question, nextItem } from '../../types/Questions';
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
    const [selectedOption, setSelectedOption] = useState<string>('');
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
                        quest.title = item.title
                        quest.nextContetId = item.nextContetId
                        quest.nextQuestionId = item.nextQuestionId
                        quest.previusContetId = item.previusContetId
                        quest.previusQuestionId = item.previusQuestionId
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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
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
                                <div className="col-span-3 flex items-center">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <p className="text-sm text-black dark:text-white">
                                            {item.type === 'question' ? item.quest.title : item.content.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-2 hidden items-center sm:flex">
                                    <p className="text-sm text-black dark:text-white">
                                        10
                                    </p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-black dark:text-white">
                                        20
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
                            </div>
                        ))}
                    </div>
                </div>

            </div>



            <button
                type='button'
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={openModal}
            >
                Open Modal
            </button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2 className="text-xl font-bold mb-4">Edit question</h2>
                <div>
                    <label className="mb-3 block text-black dark:text-white" htmlFor=''>
                        Type
                    </label>

                    <div className="relative z-20 bg-white dark:bg-form-input">
                        <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g opacity="0.8">
                                    {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M10.0007 2.50065C5.85852 2.50065 2.50065 5.85852 2.50065 10.0007C2.50065 14.1428 5.85852 17.5007 10.0007 17.5007C14.1428 17.5007 17.5007 14.1428 17.5007 10.0007C17.5007 5.85852 14.1428 2.50065 10.0007 2.50065ZM0.833984 10.0007C0.833984 4.93804 4.93804 0.833984 10.0007 0.833984C15.0633 0.833984 19.1673 4.93804 19.1673 10.0007C19.1673 15.0633 15.0633 19.1673 10.0007 19.1673C4.93804 19.1673 0.833984 15.0633 0.833984 10.0007Z"
                                        fill="#637381"
                                    ></path>
                                    {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M0.833984 9.99935C0.833984 9.53911 1.20708 9.16602 1.66732 9.16602H18.334C18.7942 9.16602 19.1673 9.53911 19.1673 9.99935C19.1673 10.4596 18.7942 10.8327 18.334 10.8327H1.66732C1.20708 10.8327 0.833984 10.4596 0.833984 9.99935Z"
                                        fill="#637381"
                                    ></path>
                                    {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M7.50084 10.0008C7.55796 12.5632 8.4392 15.0301 10.0006 17.0418C11.5621 15.0301 12.4433 12.5632 12.5005 10.0008C12.4433 7.43845 11.5621 4.97153 10.0007 2.95982C8.4392 4.97153 7.55796 7.43845 7.50084 10.0008ZM10.0007 1.66749L9.38536 1.10547C7.16473 3.53658 5.90275 6.69153 5.83417 9.98346C5.83392 9.99503 5.83392 10.0066 5.83417 10.0182C5.90275 13.3101 7.16473 16.4651 9.38536 18.8962C9.54325 19.069 9.76655 19.1675 10.0007 19.1675C10.2348 19.1675 10.4581 19.069 10.6159 18.8962C12.8366 16.4651 14.0986 13.3101 14.1671 10.0182C14.1674 10.0066 14.1674 9.99503 14.1671 9.98346C14.0986 6.69153 12.8366 3.53658 10.6159 1.10547L10.0007 1.66749Z"
                                        fill="#637381"
                                    ></path>
                                </g>
                            </svg>
                        </span>

                        <select
                            value={selectedOption}
                            onChange={(e) => {
                                setSelectedOption(e.target.value);
                                changeTextColor();
                            }}
                            className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-12 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''
                                }`}
                        >
                            <option value="" disabled className="text-body dark:text-bodydark">
                                Select Country
                            </option>
                            <option value="USA" className="text-body dark:text-bodydark">
                                USA
                            </option>
                            <option value="UK" className="text-body dark:text-bodydark">
                                UK
                            </option>
                            <option value="Canada" className="text-body dark:text-bodydark">
                                Canada
                            </option>
                        </select>

                        <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g opacity="0.8">
                                    {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                        fill="#637381"
                                    ></path>
                                </g>
                            </svg>
                        </span>
                    </div>

                    <div>

                        <label className="mb-3 block text-black dark:text-white" htmlFor=''>
                            Question
                        </label>

                        <input
                            type="text"
                            placeholder="Default Input"
                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                    </div>
                </div>
            </Modal>





        </>
    );
};

export default LevelEdit;
