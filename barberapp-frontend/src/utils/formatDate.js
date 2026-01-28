import dayjs from "dayjs";
import "dayjs/locale/es";

export const formatDate = (date, format = "DD/MM/YYYY") => {
    if (!date) return "";
    return dayjs(date).locale("es").format(format);
};

export const formatTime = (time) => {
    return time ? `${time} hs` : "";
};
