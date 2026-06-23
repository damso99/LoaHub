package com.loahub.common.mapper;

import com.loahub.common.model.DomainModels.LostArkCalendarSchedule;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LostArkCalendarScheduleMapper {
    void deleteByWeekRange(@Param("weekStartDate") LocalDate weekStartDate, @Param("weekEndDate") LocalDate weekEndDate);

    void insertSchedules(@Param("items") List<LostArkCalendarSchedule> items);

    List<LostArkCalendarSchedule> findActiveByStartTimeRange(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    List<LostArkCalendarSchedule> findActiveByDate(@Param("date") LocalDate date);

    List<LostArkCalendarSchedule> findActiveWeek();
}
