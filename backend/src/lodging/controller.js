// backend/src/lodging/controller.js

const Lodging = require("./model");
const { successResponse, errorResponse } = require("../common/response");

// 1. 숙소 목록 조회 (검색 기능 포함)
exports.getLodgings = async (req, res) => {
  try {
    const { loc, checkIn, checkOut, category } = req.query;
    let query = {};

    // 지역(loc) 검색 로직 (포함 검색)
    if (loc) {
      query.$or = [
        { address: { $regex: loc, $options: 'i' } },      // 주소
        { country: { $regex: loc, $options: 'i' } },      // 나라
        { lodgingName: { $regex: loc, $options: 'i' } },  // 이름
        { hashtag: { $regex: loc, $options: 'i' } }       // 해시태그
      ];
    }

    // 카테고리 필터
    if (category) {
      query.category = category;
    }

    const lodgings = await Lodging.find(query);

    // 검색 결과가 없어도 빈 배열([])을 보내줘야 프론트가 에러 안 남
    res.status(200).json(successResponse(lodgings || [], `${lodgings.length}개 발견`));

  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse(err.message, 500));
  }
};

// 🚨 [부활] 2. 숙소 상세 조회 (이게 없어서 상세페이지가 안 떴던 것!)
exports.getLodgingDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // DB에서 ID로 찾기
    const lodging = await Lodging.findById(id);

    if (!lodging) {
      return res.status(404).json(errorResponse("숙소를 찾을 수 없습니다.", 404));
    }

    res.status(200).json(successResponse(lodging, "숙소 상세 조회 성공"));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse("잘못된 요청입니다. (ID 형식을 확인하세요)", 500));
  }
};

// 🚨 [부활] 3. 객실 목록 조회 (이것도 필요할 수 있음)
// (만약 rooms 컨트롤러가 따로 있다면 생략 가능하지만, 보통 같이 둠)
// 하지만 작성자님 구조상 /api/rooms/:lodgingId 로 요청한다면 room/controller.js 에 있어야 함.
// lodgings/:id 호출 시에는 위의 getLodgingDetail만 있으면 됩니다.