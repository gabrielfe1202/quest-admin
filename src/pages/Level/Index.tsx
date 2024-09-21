import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { httpInstance } from '../../services/HttpRequest';
import { useNavigate } from 'react-router-dom';

const Level = () => {
	const [levels, setLevels] = useState([])
	const navigate = useNavigate();

	useEffect(() => {
		httpInstance
			.get('/LevelList')
			.then((response) => {
				setLevels(response.data);
			})
			.catch((error) => {
				console.error("Erro ao buscar dados:", error);
			});
	}, []);

	return (
		<>
			<Breadcrumb pageName="Levels" />

			<div className="flex flex-col gap-10">
				<div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
					<div className="max-w-full overflow-x-auto">
						<table className="w-full table-auto">
							<thead>
								<tr className="bg-gray-2 text-left dark:bg-meta-4">
									<th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
										Title
									</th>
									<th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
										Status
									</th>									
									<th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
										Order
									</th>
									<th className="py-4 px-4 font-medium text-black dark:text-white">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
								{levels.map((item: any) => (
									<tr key={0}>
										<td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
											<h5 className="font-medium text-black dark:text-white">
												{item.title}
											</h5>
										</td>

										<td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
											<p
												className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${item.active
													? 'bg-success text-success'
													: 'bg-danger text-danger'}`}
											>
												{item.active ? "active" : "inactive"}
											</p>
										</td>

										
										<td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
											<h5 className="font-medium text-black dark:text-white">
												{item.order}
											</h5>
										</td>

										<td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
											<div className="flex items-center space-x-3.5">
												<button type='button' className="hover:text-primary" onClick={() => navigate(`/Level/Edit/${item.id}`)}>
													<FontAwesomeIcon icon={faEye} />
												</button>
												<button type='button' className="hover:text-primary">
													<FontAwesomeIcon icon={faTrash} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	);
};

export default Level;
