import { Rings } from "react-loader-spinner"; 
const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-gray-800 bg-opacity-50" 
        style={{
          backdropFilter: 'blur(5px)', 
        }}
      ></div>
      <div className="flex flex-col items-center relative p-8 rounded-lg bg-white shadow-lg">
        <img
          src="driverImage.png"
          alt="Driver"
          className="w-32 h-32 rounded-full mb-4"
        />
        <Rings
          height="100"
          width="100"
          color="#000000" 
          radius="6"
          visible={true}
          ariaLabel="rings-loading"
        />
        <p className="mt-4">Loading, please wait...</p>
      </div>
    </div>
  );
};
export default Loader;
