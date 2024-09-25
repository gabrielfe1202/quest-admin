import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { httpInstance } from '../../services/HttpRequest';
import { useNavigate, useParams } from 'react-router-dom';
import { Content, type nextItem, Question, Option, ItemQuest } from '../../types/Questions';

type LevelPublishParams = {
    id: string;
};

const LevelPublish = () => {
    const { id } = useParams<LevelPublishParams>();
    const [title, setTitle] = useState<string>()
    const [order, setOrder] = useState<number>()
    const [questions] = useState<Question[]>([])
    const [contents] = useState<Content[]>([])
    const [itemQuest, setItemQuest] = useState<nextItem[]>([])
    const navigate = useNavigate()


    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {


        httpInstance
            .get(`/Level/infos/${id}`)
            .then((response) => {
                console.log(response.data)
                setTitle(response.data.level.title)
                setOrder(response.data.level.order)
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                response.data.questions.map((item: any) => {
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


    return (
        <>
            <Breadcrumb pageName="Levels Publish" />

            <div className="grid grid-cols-1 gap-9 ">
                <div className="flex flex-col gap-9">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">

                        <div className="flex flex-col gap-5.5 p-6.5">

                            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                                <p className="text-2xl font-bold text-black dark:text-white">
                                    Title: {title}
                                </p>
                            </div>

                            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                                <p className="text-2xl font-bold text-black dark:text-white">
                                    Order: {order}
                                </p>
                            </div>

                            <div className="flex flex-col gap-9">
                                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                                    <div className="py-6 px-4 md:px-6 xl:px-7.5">
                                        <h4 className="text-xl font-semibold text-black dark:text-white">
                                            Questions & contents
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-3 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                                        <div className="col-span-3 flex items-center">
                                            <p className="font-medium">Title</p>
                                        </div>
                                        <div className="col-span-2 hidden items-center sm:flex">
                                            <p className="font-medium">Options</p>
                                        </div>
                                        <div className="col-span-1 flex items-center">
                                            <p className="font-medium">Type</p>
                                        </div>
                                    </div>

                                    {itemQuest.map((item, key) => (
                                        <>

                                            {item.type === 'question' ? (
                                                <>
                                                    <div
                                                        className="grid grid-cols-3 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                                        key={key.toString()}

                                                    >
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
                                                    </div>
                                                    <div key={key.toString()} className='p-5 border-t-[1.5px] border-stroke' >
                                                        <div className="flex flex-col gap-9 ml-24">
                                                            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                                                                <div className="py-3 px-2 md:px-6 xl:px-7.5">
                                                                    <h5 className="text-lg font-semibold text-black dark:text-white">
                                                                        Options
                                                                    </h5>
                                                                </div>

                                                                <div className="grid grid-cols-3 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                                                                    <div className="col-span-3 flex items-center">
                                                                        <p className="font-medium">Title</p>
                                                                    </div>
                                                                    <div className="col-span-2 hidden items-center sm:flex">
                                                                        <p className="font-medium">Points</p>
                                                                    </div>
                                                                    <div className="col-span-1 flex items-center">
                                                                        <p className="font-medium">Correct</p>
                                                                    </div>
                                                                </div>

                                                                {item.quest.options.map((op, key) => (
                                                                    <div
                                                                        className="grid grid-cols-3 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                                                        key={key.toString()}

                                                                    >
                                                                        <>
                                                                            <div className="col-span-3 flex items-center">
                                                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                                                    <p className="text-sm text-black dark:text-white">
                                                                                        {op.title}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-span-2 hidden items-center sm:flex">
                                                                                <p className="text-sm text-black dark:text-white">
                                                                                    {op.points}
                                                                                </p>
                                                                            </div>
                                                                            <div className="col-span-1 flex items-center">
                                                                                <p className="text-sm text-black dark:text-white">
                                                                                    <p
                                                                                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${op.correct
                                                                                            ? 'bg-success text-success'
                                                                                            : 'bg-danger text-danger'}`}
                                                                                    >
                                                                                        {op.correct ? "True" : "False"}
                                                                                    </p>
                                                                                </p>
                                                                            </div>
                                                                        </>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className="grid grid-cols-3 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                                        key={key.toString()}

                                                    >
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
                                                    </div>
                                                    <div key={key.toString()} className='p-5 border-t-[1.5px] border-stroke' >
                                                        <div className="flex flex-col gap-9 ml-24">
                                                            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                                                                <div className="py-3 px-2 md:px-6 xl:px-7.5">
                                                                    <h5 className="text-lg font-semibold text-black dark:text-white">
                                                                        Preview
                                                                    </h5>
                                                                </div>

                                                                <div className="border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                                                                    {item.content.text}
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                        </>
                                    ))}
                                </div>
                            </div>

                            <div className='flex flex-row justify-end gap-4'>
                                <button
                                    type='button'
                                    className='w-40 inline-flex items-center text-lg justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:opacity-75'
                                    onClick={() => navigate(`/Level/Edit/${id}`)}                                    
                                >
                                    Back
                                </button>

                                <button
                                    type='button'
                                    className='w-40 inline-flex items-center text-lg justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:opacity-75'
                                    onClick={() => {}}                                    
                                >
                                    Publish
                                </button>
                            </div>

                        </div>
                    </div>
                </div >
            </div >
        </>
    )
}

export default LevelPublish;