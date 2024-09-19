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
    id: string;
    content: string;
  }
  
  // Função para reordenar a lista
  const reorder = (list: Item[], startIndex: number, endIndex: number): Item[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };

const LevelEdit = () => {
    const { id } = useParams<LevelEditParams>();
    const [level, setLevel] = useState<any>({})
    const [title, setTitle] = useState<string>()
    const [active, setActive] = useState<boolean>()

    useEffect(() => {

        httpInstance
            .get(`/Level/infos/${id}`)
            .then((response) => {
                console.log(response.data)
                setLevel(response.data.level)
                setTitle(response.data.level.title)
                setActive(response.data.level.active)
            })
            .catch((error) => {
                console.error("Erro ao buscar dados:", error);
            });

    }, [id])

    const sendEdit = () => {
        httpInstance
            .put(`/Level/Edit/${id}`, {
                title: title,
                active: active
            })
            .then((response) => {
                console.log(response)
            })
    }

    const [items, setItems] = useState<Item[]>([
        { id: '1', content: 'Item 1' },
        { id: '2', content: 'Item 2' },
        { id: '3', content: 'Item 3' },
        { id: '4', content: 'Item 4' },
      ]);
    
      // Função para lidar com o final do drag
      const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
          return; // Se for fora de uma área droppable, não faz nada
        }
    
        const reorderedItems = reorder(
          items,
          result.source.index,
          result.destination.index
        );
    
        setItems(reorderedItems); // Atualiza a lista
      };
    

    return (
        <>
            <Breadcrumb pageName="Levels Edit" />

            <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
              <Draggable key={'1'} draggableId={'1'} index={0}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      userSelect: 'none',
                      padding: 16,
                      margin: '0 0 8px 0',
                      backgroundColor: '#fff',
                      border: '1px solid lightgrey',
                      borderRadius: '4px',
                      ...provided.draggableProps.style,
                    }}
                  >
                111
                  </div>
                )}
              </Draggable>

              <Draggable key={'2'} draggableId={'2'} index={1}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      userSelect: 'none',
                      padding: 16,
                      margin: '0 0 8px 0',
                      backgroundColor: '#fff',
                      border: '1px solid lightgrey',
                      borderRadius: '4px',
                      ...provided.draggableProps.style,
                    }}
                  >
                222
                  </div>
                )}
              </Draggable>

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>

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
                                Top Products
                            </h4>
                        </div>

                        <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                            <div className="col-span-3 flex items-center">
                                <p className="font-medium">Product Name</p>
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

                        {productData.map((product, key) => (
                            <div
                                className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                key={key}
                            >
                                <div className="col-span-3 flex items-center">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <div className="h-12.5 w-15 rounded-md">
                                            <img src={product.image} alt="Product" />
                                        </div>
                                        <p className="text-sm text-black dark:text-white">
                                            {product.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-2 hidden items-center sm:flex">
                                    <p className="text-sm text-black dark:text-white">
                                        {product.category}
                                    </p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-black dark:text-white">
                                        ${product.price}
                                    </p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-black dark:text-white">{product.sold}</p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-meta-3">${product.profit}</p>
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
