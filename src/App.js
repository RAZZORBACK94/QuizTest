import axios from "axios";
import "./App.css";
import { useEffect, useState, useRef } from "react";
import Coundown from "./coundown";

function App() {
  const [question, setQuestion] = useState([]);
  const [category, setCategory] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [correct, setCorrect] = useState([]);

  const [isCorrect, setIsCorrect] = useState(null);
  const [choice, setChoice] = useState();
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState("");
  const [time, setTime] = useState(0);
  const [resume, setResume] = useState(false);

  const[reload, setReload] = useState(false)

  // Using useRef to hold mutable values
  const indexRef = useRef(0);
  const rightRef = useRef(0);
  const wrongRef = useRef(0);
  const clickRef = useRef(0);

  let hasFetch = false;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index between 0 and i
      const j = Math.floor(Math.random() * (i + 1));

      // Swap elements at indices i and j
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async function combineAnswers(data, correctAnswer) {
    let allAnswers = [];
    data.forEach((item) => {
      allAnswers.push(item);
    });
    allAnswers.push(correctAnswer);
    //Randomize order of answers in array
    return await shuffle(allAnswers);
  }

  async function getData() {
    if (hasFetch) return;

    hasFetch = true;
    try {
      const respon = await axios.get(
        "https://opentdb.com/api.php?amount=5&type=multiple"
      );
      const data = respon.data.results;

      let questionArray = [];
      let categoryArray = [];
      let correctArray = [];
      let answerArray = [];

      data.forEach(async (item) => {
        questionArray.push(item.question);
        categoryArray.push(item.category);
        correctArray.push(item.correct_answer);
        answerArray.push(
          await combineAnswers(item.incorrect_answers, item.correct_answer)
        );
      });

      console.log(data);

      setQuestion(questionArray);
      setCategory(categoryArray);
      setCorrect(correctArray);
      setAnswer(answerArray);
    } catch (err) {
      console.log("there is error: " + err);
    }
  }

  function removeCharacters(question) {
    if (question) {
      return question.replace(/(&quot;|&rsquo;|&#039;|&amp;)/g, (match) => {
        switch (match) {
          case "&quot;":
            return '"';
          case "&rsquo;":
            return '"';
          case "&#039;":
            return "'";
          case "&amp;":
            return "&";
          default:
            return match; // Fallback case
        }
      });
    }
  }

  function verify(value, key) {
    setChoice(key);
    if (value.includes(correct[indexRef.current])) {
      setIsCorrect(true);
      rightRef.current += 1; // Update ref value
    } else {
      setIsCorrect(false);
      wrongRef.current += 1; // Update ref value
    }
    clickRef.current += 1; // Update ref value

    setTimeout(() => {
      setIsCorrect(null);
      setChoice(null);
      indexRef.current += 1; // Update ref value
    }, 2000);
  }

  const choicebg = (data, value, key) => {
    if (data === true) {
      if (correct.includes(value)) {
        return "bg-green-500";
      } else {
        return "bg-white";
      }
    } else if (data === false) {
      if (correct.includes(value)) {
        return "bg-green-500";
      } else if (key === choice) {
        return "bg-red-500";
      } else {
        return "bg-white";
      }
    } else {
      return "bg-white hover:bg-violet-500 hover:text-white";
    }
  };

  const login = () => {
    const nama = localStorage.getItem("user");
    if (nama === user) {
      setResume(true);
    } else {
      indexRef.current = 0;
      rightRef.current = 0;
      wrongRef.current = 0;
      clickRef.current = 0;

      const save = {
        index: indexRef.current,
        right: rightRef.current,
        wrong: wrongRef.current,
        click: clickRef.current,
      };
      
      setTime(500)
      localStorage.setItem("time", time)
      localStorage.setItem("save", JSON.stringify(save))
      localStorage.setItem("user", user);
    }
    setLogged(true);
  };

  const reset = () => {

    indexRef.current = 0;
    rightRef.current = 0;
    wrongRef.current = 0;
    clickRef.current = 0;
    
    setTime(500)
    setReload((prevstate) => !prevstate)
  };

  const playAgain = () => {
    const timer = localStorage.getItem("time");
    setTime(timer);
    setResume(false);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("save");
    localStorage.removeItem("time");
    setLogged(false);
  };

  useEffect(() => {
    const timer = localStorage.getItem("time");
    if (timer && timer !== 500) {
      const save = JSON.parse(localStorage.getItem("save"));
      indexRef.current = save.index;
      rightRef.current = save.right;
      wrongRef.current = save.wrong;
      clickRef.current = save.click;
    }
    getData();
  }, []);

  useEffect(() => {
    const save = {
      index: indexRef.current,
      right: rightRef.current,
      wrong: wrongRef.current,
      click: clickRef.current,
    };
    localStorage.setItem("save", JSON.stringify(save));
  }, [indexRef.current, rightRef.current, wrongRef.current, clickRef.current]);

  return (
    <div className="bg-violet-500 h-screen flex items-center justify-center ">
      <div
        className={` ${
          resume ? "" : "hidden"
        } fixed top-0 h-screen w-screen flex justify-center items-center bg-black bg-opacity-50`}
      >
        <div className="bg-white p-5 rounded-xl flex flex-col space-y-5">
          <p className="text-3xl font-bold text-violet-500">
            Anda Ingin Melanjutkan Quiz Sebelumnya?
          </p>
          <p>Terdapat data simpanan yang terdeteksi di dalam sistem</p>

          <div className="flex space-x-5 m-auto">
            <button
              onClick={playAgain}
              className="p-2 bg-violet-500 rounded-xl"
            >
              <p className="text-xl font-semibold text-white">Lanjutkan</p>
            </button>
            <button
              onClick={reset}
              className="p-2 bg-white rounded-xl border-2 border-violet-500"
            >
              <p className="text-xl font-semibold text-violet-500">
                Mulai ulang
              </p>
            </button>
          </div>
        </div>
      </div>

      {!logged ? (
        <div className="flex flex-col space-y-5">
          <p className="text-6xl font-bold text-white">Quiz Online</p>

          <div className="flex flex-col space-y-2 bg-white bg-opacity-50 p-5 rounded-xl">
            <p className="text-xl font-semibold text-white">Nama</p>
            <div className="flex space-x-5">
              <input
                type="text"
                placeholder="masukkan nama"
                onChange={(e) => setUser(e.target.value)}
                className=" bg-white p-2 w-96 rounded-lg focus:outline-violet-500 focus:outline-8"
              />
              <button
                onClick={login}
                className="bg-violet-500 px-3 py-2 rounded-xl text-white font-semibold active:scale-90 transition-all"
              >
                <p className="text-xl">Login</p>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {indexRef.current < question.length ? (
            <div className="flex- space-y-10 bg-white w-1/2 p-5 rounded-xl">
              {!resume ? (
                <Coundown
                  seconds={time}
                  endFunction={() => (indexRef.current = question.length)}
                />
              ) : (
                <></>
              )}
              <div className="flex-col space-y-2">
                <p className="text-3xl font-bold text-violet-500">
                  <span>{indexRef.current + 1}.</span>
                  {removeCharacters(question[indexRef.current])}
                </p>
                <p className="p-2 bg-violet-500 text-white font-semibold w-max rounded-xl m-auto">
                  {removeCharacters(category[indexRef.current])}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {Array.isArray(answer[indexRef.current]) &&
                  answer[indexRef.current].map((item, index) => (
                    <button
                      key={index} // Add a unique key for each item
                      onClick={() => verify(item, index)} // Ensure to wrap in a function to avoid immediate invocation
                      disabled={isCorrect !== null}
                      className={`${choicebg(
                        isCorrect,
                        item,
                        index
                      )} p-2 w-full shadow-lg font-semibold active:scale-90 border-2 border-slate-50 rounded-xl transition-all`}
                    >
                      {removeCharacters(item)}
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-5 p-5 w-1/3 bg-white rounded-xl">
              <div className="p-5 py-6 rounded-full w-max bg-violet-500">
                <p className="text-5xl font-bold text-white">
                  {(rightRef.current / question.length) * 100}
                </p>
              </div>

              <p className="text-3xl font-bold">Selesai Semua</p>

              <div className="flex space-x-2 font-semibold">
                <div>
                  <p>Jawaban Benar:</p>
                  <p>Jawaban Salah:</p>
                  <p>Jumlah Jawab:</p>
                </div>
                <div>
                  <p>{rightRef.current}</p>
                  <p>{wrongRef.current}</p>
                  <p>{clickRef.current}</p>
                </div>
              </div>

              <div className="flex space-x-5">
                <button
                  onClick={reset}
                  className="p-2 bg-violet-500 text-white font-semibold text-xl rounded-xl hover:bg-violet-700"
                >
                  Coba lagi
                </button>
                <button
                  onClick={logout}
                  className="p-2 bg-violet-500 text-white font-semibold text-xl rounded-xl hover:bg-violet-700"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
