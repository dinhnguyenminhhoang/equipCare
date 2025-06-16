import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartCard = ({ title, type, data, options = {} }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: type === "doughnut" ? "bottom" : "top",
      },
    },
    ...(type === "line" && {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }),
    ...options,
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        {type === "line" ? (
          <Line data={data} options={defaultOptions} />
        ) : type === "doughnut" ? (
          <Doughnut data={data} options={defaultOptions} />
        ) : null}
      </div>
    </div>
  );
};



export default ChartCard;
