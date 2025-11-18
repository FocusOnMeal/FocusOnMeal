package com.fom.boot.common.pagination;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PageInfo {
	private int currentPage;
	private int totalCount;
	private int naviLimit;
	private int maxPage;
	private int startNavi;
	private int endNavi;
	private int boardLimit;
	private int startRow;
	private int endRow;

}

